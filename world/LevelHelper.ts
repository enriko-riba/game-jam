import { IRootObject, ILevelDefinition, ITemplate, IMapEntity, IMobEntity } from './LevelInterfaces';

/**
* Returns all assets referenced in the level.
* @param root
* @param levelId
*/
export function GetLevelAssets(root: IRootObject, levelId: number): string[] {
    var assets: string[] = [];

    var level: ILevelDefinition = undefined;
    for (var i = 0; i < root.levels.length; i++) {
        if (root.levels[i].id === levelId) {
            level = root.levels[i];
            break;
        }
    }

    if (level) {
        level.parallax.forEach((iplx) => {
            assets = assets.concat(iplx.textures);
        });

        if (level.assets && level.assets.length > 0) {
            assets = assets.concat(level.assets);
        }

        //  merge global templates with level templates
        var templates = root.templates.concat(level.map.templates);

        // add all textures from templates (we don't need to have entities referencing the template if they are in a spawn)
        level.map.templates.forEach((tos) => {
            if (!tos.type || tos.type !== "spawn_point") {
                let templ = tos as ITemplate;
                let dispObj = templ.displayObject;
                if (dispObj.texture) {
                    if (typeof dispObj.texture === "string") {
                        assets.push(dispObj.texture);
                    } else {
                        assets = assets.concat(dispObj.texture);
                    }
                }
                if (dispObj.sequences) {
                    dispObj.sequences.forEach((item) => {
                        assets.push(item.texture);
                    });
                }
            }
        });

        level.map.entities.forEach((entity: IMapEntity) => {
            let defs = getEntityDefinition(templates, entity);
            if (defs.doDef.texture) {
                if (typeof defs.doDef.texture === "string") {
                    assets.push(defs.doDef.texture);
                } else {
                    assets = assets.concat(defs.doDef.texture);
                }
            }
            if (defs.doDef.sequences) {
                defs.doDef.sequences.forEach((item) => {
                    assets.push(item.texture);
                });
            }
        });

        level.map.NPC = level.map.NPC || [];
        level.map.NPC.forEach((tos: IMobEntity) => {
            //  check if its a template or spawn_point
            if (tos.type && tos.type === "spawn_point") {

            } else {
                //  this is an entity definition
                let entity: IMobEntity = tos as IMobEntity;

                //  concat attack (string | string[])
                if (entity.attack) {
                    assets = assets.concat(entity.attack);
                }

                var entityTemplate = templates.filter((item) => item.name === entity.template);
                if (entityTemplate && entityTemplate.length > 0) {
                    var template = entityTemplate[0];
                    // var temp = $.extend(true, {}, template.displayObject);
                    // var displayObjectDefinition = $.extend(temp, entity);
                    var displayObjectDefinition = { ...template.displayObject, ...entity };
                    if (displayObjectDefinition.texture) {
                        if (typeof displayObjectDefinition.texture === "string") {
                            assets.push(displayObjectDefinition.texture);
                        } else {
                            assets = assets.concat(displayObjectDefinition.texture);
                        }
                    }

                    if (displayObjectDefinition.attack) {
                        assets = assets.concat(displayObjectDefinition.attack);
                    }

                    if (displayObjectDefinition.sequences) {
                        displayObjectDefinition.sequences.forEach((item) => {
                            //  add only if texture exists
                            if (item.texture) {
                                assets.push(item.texture);
                            }
                        });
                    }
                }
            }
        });
    }

    assets = getUniqueItems(assets);
    return assets;
}

/**
* Returns an object containing extracted display object and body definitions.
* @param templates
* @param entity
*/
export function getEntityDefinition(templates: Array<any>, entity: IMapEntity | IMobEntity) {
    let displayObjectDefinition = null;
    let bodyDefinition = null;
    let template = {
        name: null,
        displayObject: { typeName: "Sprite" }, //    sprite is the default if no template exists
        body: null,
        trigger: null,
        drop: null
    };
    var entityTemplate = templates.filter((item) => item.name === entity.template);
    if (entityTemplate && entityTemplate.length > 0) {
        template = entityTemplate[0];
    }
    displayObjectDefinition = { ...template.displayObject, ...entity };

    if (template.drop) {
        displayObjectDefinition = { ...displayObjectDefinition, drop: template.drop }
    }
    if (template.body) {
        bodyDefinition = template.body;
    }

    let triggerTemplate = undefined;
    if (template.trigger || displayObjectDefinition.trigger) {
        triggerTemplate = { ...template.trigger, ...displayObjectDefinition.trigger };
    }
    return {
        templateName: template.name,
        doDef: displayObjectDefinition,
        bdDef: bodyDefinition,
        trigger: triggerTemplate
    };
}
/**
 * Returns a filtered array with unique only items from the input array
 * @param arr 
 */
export function getUniqueItems(arr) {
    var n = {}, r = [];
    for (var i = 0; i < arr.length; i++) {
        if (!n[arr[i]]) {
            n[arr[i]] = true;
            r.push(arr[i]);
        }
    }
    return r;
}

