package com.coastlinerush.game;

/** File types served from the APK's private WebView asset origin. */
final class AssetPolicy {
    static String mimeType(String name) {
        if (name == null || name.contains("..") || name.contains("\\")) return null;
        if (name.endsWith(".js")) return "application/javascript";
        if (name.endsWith(".css")) return "text/css";
        if (name.endsWith(".svg")) return "image/svg+xml";
        if (name.endsWith(".glb")) return "model/gltf-binary";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".jpg")) return "image/jpeg";
        if (name.endsWith(".hdr")) return "application/octet-stream";
        if (name.endsWith(".ttf")) return "font/ttf";
        return null;
    }

    static String encoding(String name) {
        return name.endsWith(".js") || name.endsWith(".css") || name.endsWith(".svg")
            ? "UTF-8" : null;
    }
}
