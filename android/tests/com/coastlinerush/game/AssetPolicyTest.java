package com.coastlinerush.game;

import java.nio.file.*;
import java.util.stream.Stream;

public class AssetPolicyTest {
    private static void check(boolean value, String message) {
        if (!value) throw new AssertionError(message);
    }

    public static void main(String[] args) throws Exception {
        String[] skies = {
            "assets/routes/evening_road_01_puresky_1k.hdr",
            "assets/routes/kloofendal_48d_partly_cloudy_puresky_2k.hdr"
        };
        for (String sky : skies) {
            check("application/octet-stream".equals(AssetPolicy.mimeType(sky)), "HDR blocked: " + sky);
            check(AssetPolicy.encoding(sky) == null, "HDR must be served as binary");
            check(Files.size(Paths.get(args[0], sky)) > 1000000, "Missing HDR: " + sky);
        }
        try (Stream<Path> files = Files.walk(Paths.get(args[0], "assets", "routes"))) {
            files.filter(Files::isRegularFile).filter(p -> p.toString().matches(".*\\.(hdr|glb|jpg|png)$"))
                .forEach(p -> {
                    String name = p.getFileName().toString();
                    check(AssetPolicy.mimeType(name) != null, "Route asset blocked: " + name);
                    check(AssetPolicy.encoding(name) == null, "Binary asset given text encoding: " + name);
                });
        }
        for (String name : new String[] { "game3d.js", "style.css", "pedal.svg" }) {
            check(AssetPolicy.mimeType(name) != null, "Text asset blocked");
            check("UTF-8".equals(AssetPolicy.encoding(name)), "Text encoding changed");
        }
        for (String name : new String[] { "../secret.hdr", "assets/../../secret.js", "secret\\file.js", "index.html", "file.exe" }) {
            check(AssetPolicy.mimeType(name) == null, "Unsafe asset allowed: " + name);
        }
        check(AssetPolicy.mimeType(null) == null, "Null path allowed");
        check("font/ttf".equals(AssetPolicy.mimeType("assets/fonts/DMSans.ttf")), "Offline menu font blocked");
        check(AssetPolicy.encoding("assets/fonts/DMSans.ttf") == null, "Font must be served as binary");
        System.out.println("PASS: both route HDR skies, all route binary assets, text assets, and blocked paths");
    }
}
