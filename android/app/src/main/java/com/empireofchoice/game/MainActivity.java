package com.empireofchoice.game;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register custom plugins
        registerPlugin(PlayGamesPlugin.class);

        super.onCreate(savedInstanceState);
    }
}
