{
  description = "Cryptocurrency Transaction Tracing System Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forEachSupportedSystem = f: nixpkgs.lib.genAttrs supportedSystems (system: f {
        pkgs = import nixpkgs { inherit system; };
      });
    in
    {
      devShells = forEachSupportedSystem ({ pkgs }: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            pnpm
            bun
            git
            ripgrep
          ];

          shellHook = ''
            echo "🚀 Crypto Transaction Tracing Dev Shell Activated"
            echo "Node: $(node --version 2>/dev/null || echo 'N/A')"
            echo "Bun:  $(bun --version 2>/dev/null || echo 'N/A')"
          '';
        };
      });
    };
}
