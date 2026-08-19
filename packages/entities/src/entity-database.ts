import { Entity, EntityAddressMapping, EntityType } from "@crypto-tracer/types";
import { SEED_ENTITIES } from "./seed-data";
import { OFACSanctionsService } from "./ofac-service";

export class EntityDatabase {
  private entities: Map<string, Entity> = new Map();
  private addressToEntity: Map<string, { entity: Entity; mapping: EntityAddressMapping }> = new Map();
  private ofacService: OFACSanctionsService;

  constructor(initialEntities: Entity[] = SEED_ENTITIES) {
    this.ofacService = new OFACSanctionsService();
    for (const entity of initialEntities) {
      this.registerEntity(entity);
    }
    // Asynchronously fetch live Treasury OFAC SDN list
    this.ofacService.loadLiveSanctionsList().catch(() => {});
  }

  registerEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
    for (const mapping of entity.addresses) {
      this.addressToEntity.set(mapping.address.toLowerCase(), {
        entity,
        mapping,
      });
    }
  }

  getEntityById(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  getEntityByAddress(address: string): { entity: Entity; mapping: EntityAddressMapping } | undefined {
    const cleanAddr = address.toLowerCase().trim();
    let match = this.addressToEntity.get(cleanAddr);
    
    // If not found in local seed map, check against OFAC SDN List
    if (!match && this.ofacService.isSanctioned(cleanAddr)) {
      const ofacEntity = this.ofacService.createOfacEntity(cleanAddr);
      this.registerEntity(ofacEntity);
      match = this.addressToEntity.get(cleanAddr);
    }

    return match;
  }

  isAddressKnown(address: string): boolean {
    return !!this.getEntityByAddress(address);
  }

  isMixer(address: string): boolean {
    const match = this.getEntityByAddress(address);
    return match?.entity.type === "MIXER";
  }

  isBridge(address: string): boolean {
    const match = this.getEntityByAddress(address);
    return match?.entity.type === "BRIDGE";
  }

  isExchange(address: string): boolean {
    const match = this.getEntityByAddress(address);
    return match?.entity.type === "EXCHANGE";
  }

  isIllicit(address: string): boolean {
    const match = this.getEntityByAddress(address);
    return match?.entity.type === "KNOWN_ILLICIT" || match?.entity.type === "SCAM";
  }

  search(query: string, type?: EntityType): Entity[] {
    const q = query.toLowerCase().trim();
    let results = Array.from(this.entities.values());

    if (type) {
      results = results.filter((e) => e.type === type);
    }

    if (q) {
      results = results.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.addresses.some((a) => a.address.toLowerCase().includes(q) || a.label?.toLowerCase().includes(q))
      );
    }

    return results;
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }
}
