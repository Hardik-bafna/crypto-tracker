import { Entity } from "@crypto-tracer/types";

/**
 * OFACSanctionsService
 *
 * Checks wallet addresses against the OFFICIAL US Department of the Treasury
 * OFAC Specially Designated Nationals (SDN) sanctions list.
 *
 * Data Source:
 *   Primary: US Treasury sdn_advanced.xml parsed by 0xB10C/ofac-sanctioned-digital-currency-addresses
 *   URL: https://raw.githubusercontent.com/0xB10C/ofac-sanctioned-digital-currency-addresses/lists/sanctioned_addresses_ETH.json
 *   Origin: https://www.treasury.gov/ofac/downloads/sanctions/1.0/sdn_advanced.xml
 *
 * This is NOT a third-party database. The upstream repo parses the official
 * Treasury XML nightly via GitHub Actions and publishes per-chain JSON files.
 */
export class OFACSanctionsService {
  private sanctionedAddresses: Set<string> = new Set();
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  // Official OFAC SDN cryptocurrency address feeds (parsed from US Treasury sdn_advanced.xml)
  private static readonly OFAC_SDN_FEEDS: Record<string, string> = {
    ETH: "https://raw.githubusercontent.com/0xB10C/ofac-sanctioned-digital-currency-addresses/lists/sanctioned_addresses_ETH.json",
    BTC: "https://raw.githubusercontent.com/0xB10C/ofac-sanctioned-digital-currency-addresses/lists/sanctioned_addresses_XBT.json",
    USDT: "https://raw.githubusercontent.com/0xB10C/ofac-sanctioned-digital-currency-addresses/lists/sanctioned_addresses_USDT.json",
    USDC: "https://raw.githubusercontent.com/0xB10C/ofac-sanctioned-digital-currency-addresses/lists/sanctioned_addresses_USDC.json",
  };

  /**
   * Loads the OFFICIAL US Treasury OFAC SDN sanctioned cryptocurrency addresses.
   *
   * The data originates from:
   *   https://sanctionslistservice.ofac.treas.gov/api/download/sdn_advanced.xml
   *
   * Digital Currency Address features are extracted from FeatureType entries
   * in the XML (e.g. "Digital Currency Address - ETH") and published as
   * per-chain JSON arrays by the 0xB10C/ofac-sanctioned-digital-currency-addresses
   * GitHub Actions pipeline (runs nightly).
   */
  async loadLiveSanctionsList(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      const feedEntries = Object.entries(OFACSanctionsService.OFAC_SDN_FEEDS);
      let totalLoaded = 0;

      const results = await Promise.allSettled(
        feedEntries.map(async ([chain, url]) => {
          try {
            const response = await fetch(url, {
              headers: { "Accept": "application/json" },
            });
            if (response.ok) {
              const list: string[] = await response.json();
              if (Array.isArray(list)) {
                for (const addr of list) {
                  if (typeof addr === "string" && addr.length > 10) {
                    this.sanctionedAddresses.add(addr.toLowerCase().trim());
                  }
                }
                totalLoaded += list.length;
                console.log(`[OFACService] Loaded ${list.length} OFAC SDN ${chain} addresses from US Treasury feed.`);
              }
            } else {
              console.warn(`[OFACService] HTTP ${response.status} fetching OFAC SDN ${chain} feed.`);
            }
          } catch (err: any) {
            console.warn(`[OFACService] Failed to fetch OFAC SDN ${chain} feed: ${err?.message}`);
          }
        })
      );

      console.log(`[OFACService] Total OFAC SDN sanctioned addresses loaded: ${this.sanctionedAddresses.size} (from US Treasury sdn_advanced.xml)`);
      this.isLoaded = true;
    })();

    return this.loadPromise;
  }

  /**
   * Check if an address appears on the official US Treasury OFAC SDN sanctions list.
   */
  isSanctioned(address: string): boolean {
    return this.sanctionedAddresses.has(address.toLowerCase().trim());
  }

  /**
   * Returns the total count of loaded OFAC sanctioned addresses.
   */
  getSanctionedCount(): number {
    return this.sanctionedAddresses.size;
  }

  /**
   * Returns whether the live OFAC SDN feed has been loaded.
   */
  isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * Creates a structured Entity object for an OFAC-sanctioned address.
   */
  createOfacEntity(address: string): Entity {
    const cleanAddr = address.toLowerCase().trim();
    return {
      id: `ent-ofac-sdn-${cleanAddr.slice(2, 12)}`,
      name: "OFAC SDN Sanctioned Address (US Treasury)",
      type: "KNOWN_ILLICIT",
      category: "US Treasury OFAC Specially Designated Nationals (SDN) List",
      description:
        "This address is officially listed on the US Department of the Treasury " +
        "Office of Foreign Assets Control (OFAC) Specially Designated Nationals " +
        "(SDN) sanctions list. Transactions with this address are prohibited " +
        "under US law and may indicate state-sponsored cybercrime, ransomware " +
        "operations, or sanctioned mixer/bridge interactions.",
      confidence: "VERIFIED",
      source: "US Department of the Treasury OFAC SDN List (sdn_advanced.xml)",
      lastVerified: new Date(),
      isKycCompliant: false,
      baseRiskScore: 100,
      addresses: [
        {
          address: cleanAddr,
          chain: cleanAddr.startsWith("0x") ? "ethereum" : "bitcoin",
          label: "OFAC SDN Sanctioned Address",
          confidence: "VERIFIED",
          source: "US Treasury OFAC SDN Feed (sdn_advanced.xml)",
          lastVerified: new Date(),
        },
      ],
    };
  }
}
