package com.empireofchoice.game;

import android.app.Activity;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.AuthenticationResult;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "PlayGames")
public class PlayGamesPlugin extends Plugin {
    private static final String TAG = "PlayGamesPlugin";
    private boolean isInitialized = false;

    @Override
    public void load() {
        super.load();
        // Initialize Play Games SDK
        PlayGamesSdk.initialize(getContext());
        isInitialized = true;
        Log.d(TAG, "Play Games SDK initialized");
    }

    @PluginMethod()
    public void isAuthenticated(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        GamesSignInClient gamesSignInClient = PlayGames.getGamesSignInClient(activity);
        gamesSignInClient.isAuthenticated().addOnCompleteListener(task -> {
            JSObject result = new JSObject();
            if (task.isSuccessful()) {
                AuthenticationResult authResult = task.getResult();
                result.put("isAuthenticated", authResult.isAuthenticated());
            } else {
                result.put("isAuthenticated", false);
            }
            call.resolve(result);
        });
    }

    @PluginMethod()
    public void signIn(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        Log.d(TAG, "Starting signIn...");
        GamesSignInClient gamesSignInClient = PlayGames.getGamesSignInClient(activity);

        // First check if already authenticated (auto sign-in from Play Games)
        gamesSignInClient.isAuthenticated().addOnCompleteListener(checkTask -> {
            boolean alreadyAuthenticated = checkTask.isSuccessful() &&
                checkTask.getResult().isAuthenticated();
            Log.d(TAG, "Already authenticated: " + alreadyAuthenticated);

            if (alreadyAuthenticated) {
                // Already signed in via auto sign-in, just get player info
                Log.d(TAG, "User already authenticated, getting player info...");
                getPlayerInfo(call);
            } else {
                // Not authenticated, try manual sign in
                Log.d(TAG, "User not authenticated, calling signIn()...");
                gamesSignInClient.signIn().addOnCompleteListener(task -> {
                    Log.d(TAG, "signIn task completed, isSuccessful: " + task.isSuccessful());
                    if (task.isSuccessful()) {
                        AuthenticationResult authResult = task.getResult();
                        Log.d(TAG, "isAuthenticated after signIn: " + authResult.isAuthenticated());
                        if (authResult.isAuthenticated()) {
                            getPlayerInfo(call);
                        } else {
                            call.reject("Sign in completed but not authenticated. Try restarting the app.");
                        }
                    } else {
                        Exception e = task.getException();
                        Log.e(TAG, "Sign in failed", e);
                        String errorMsg = e != null ? e.getClass().getSimpleName() + ": " + e.getMessage() : "unknown error";
                        call.reject("Sign in exception: " + errorMsg);
                    }
                });
            }
        });
    }

    private void getPlayerInfo(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        Log.d(TAG, "Getting player info...");
        PlayGames.getPlayersClient(activity).getCurrentPlayer().addOnCompleteListener(task -> {
            Log.d(TAG, "getCurrentPlayer completed, isSuccessful: " + task.isSuccessful());
            if (task.isSuccessful()) {
                com.google.android.gms.games.Player player = task.getResult();
                Log.d(TAG, "Player: " + player.getDisplayName() + " (" + player.getPlayerId() + ")");
                JSObject result = new JSObject();
                result.put("playerId", player.getPlayerId());
                result.put("displayName", player.getDisplayName());

                // Get server auth code for backend verification
                requestServerAuthCode(call, result);
            } else {
                Exception e = task.getException();
                Log.e(TAG, "Failed to get player info", e);
                String errorMsg = e != null ? e.getClass().getSimpleName() + ": " + e.getMessage() : "unknown error";
                call.reject("Failed to get player info: " + errorMsg);
            }
        });
    }

    private void requestServerAuthCode(PluginCall call, JSObject result) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        String webClientId = getContext().getString(R.string.game_web_client_id);
        Log.d(TAG, "Requesting server auth code with webClientId: " + webClientId);

        GamesSignInClient gamesSignInClient = PlayGames.getGamesSignInClient(activity);
        gamesSignInClient.requestServerSideAccess(webClientId, false)
            .addOnCompleteListener(task -> {
                Log.d(TAG, "requestServerSideAccess completed, isSuccessful: " + task.isSuccessful());
                if (task.isSuccessful()) {
                    String serverAuthCode = task.getResult();
                    Log.d(TAG, "Got serverAuthCode: " + (serverAuthCode != null ? "yes (length: " + serverAuthCode.length() + ")" : "null"));
                    result.put("serverAuthCode", serverAuthCode);
                    call.resolve(result);
                } else {
                    Exception e = task.getException();
                    Log.e(TAG, "Failed to get server auth code", e);
                    // Return result without server auth code but include error
                    result.put("serverAuthCode", null);
                    result.put("authCodeError", e != null ? e.getMessage() : "unknown");
                    call.resolve(result);
                }
            });
    }

    @PluginMethod()
    public void signOut(PluginCall call) {
        // Play Games v2 doesn't have explicit sign out
        // User manages this through Play Games app settings
        JSObject result = new JSObject();
        result.put("success", true);
        call.resolve(result);
    }
}
