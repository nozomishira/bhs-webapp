import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Static export: ビルド時に全ページを静的HTMLとしてエクスポート
  // 出力先: .next/export/ または out/
};

export default nextConfig;
