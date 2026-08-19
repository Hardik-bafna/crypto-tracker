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
export declare class OFACSanctionsService {
    private sanctionedAddresses;
    private isLoaded;
    private loadPromise;
    private static readonly OFAC_SDN_FEEDS;
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
    loadLiveSanctionsList(): Promise<void>;
    /**
     * Check if an address appears on the official US Treasury OFAC SDN sanctions list.
     */
    isSanctioned(address: string): boolean;
    /**
     * Returns the total count of loaded OFAC sanctioned addresses.
     */
    getSanctionedCount(): number;
    /**
     * Returns whether the live OFAC SDN feed has been loaded.
     */
    isReady(): boolean;
    /**
     * Creates a structured Entity object for an OFAC-sanctioned address.
     */
    createOfacEntity(address: string): Entity;
}
//# sourceMappingURL=ofac-service.d.ts.map