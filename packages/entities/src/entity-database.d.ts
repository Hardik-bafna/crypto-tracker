import { Entity, EntityAddressMapping, EntityType } from "@crypto-tracer/types";
export declare class EntityDatabase {
    private entities;
    private addressToEntity;
    private ofacService;
    constructor(initialEntities?: Entity[]);
    registerEntity(entity: Entity): void;
    getEntityById(id: string): Entity | undefined;
    getEntityByAddress(address: string): {
        entity: Entity;
        mapping: EntityAddressMapping;
    } | undefined;
    isAddressKnown(address: string): boolean;
    isMixer(address: string): boolean;
    isBridge(address: string): boolean;
    isExchange(address: string): boolean;
    isIllicit(address: string): boolean;
    search(query: string, type?: EntityType): Entity[];
    getAllEntities(): Entity[];
}
//# sourceMappingURL=entity-database.d.ts.map