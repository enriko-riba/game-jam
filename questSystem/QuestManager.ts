import * as Global from "../global";
import { QuestState } from "./QuestState";
import { Quest } from "./Quest";
import { ITriggerDefinition } from "../world/LevelInterfaces";
import { MainScene } from "../Scenes/MainScene";
import { CutScene } from "../Scenes/CutScene";
import { stats } from "../objects/PlayerStats";
import { StatsHud } from "../objects/StatsHud";
import { wp2 } from '../world/WorldP2';
import { snd } from '../world/SoundMan';
import { QUEST_STYLE } from '..';
import { StatType } from '../enums';

/**
 * Contains quest related logic, checks and helpers.
 */
export class QuestManager {
    private questState: Array<QuestState> = [];
    private hud: StatsHud;

    constructor(private gameScene: MainScene) {
        this.hud = this.gameScene.HudOverlay as StatsHud;
    }

    /**
     * Resets state of all quests.
     */
    public reset() {
        this.questState.forEach((qs, index) => {
            if (qs != QuestState.None) {
                var quest = this.findQuest(index);
                quest.itemsCollected  = 0;
            }
        });
        this.questState = [];
    }

    /**
     * 
     * @param itemId
     */
    public acquireItem(itemId: number) {
        //  find if there is an unfinished quest depending on that item
        let quest = this.findQuestWithItem(itemId);
        if (quest) {
            quest.itemsCollected++;
            this.hud.addQuestItemMessage(`collected ${quest.itemsCollected} / ${quest.itemsNeeded}`);
            if (quest.itemsCollected >= quest.itemsNeeded) {
                this.setQuestState(quest.id, QuestState.Completed);
                if (quest.completedMsg) {
                    this.hud.setQuestMessage(quest.completedMsg);
                }
            }
        }
    }

    /**
     * Checks if a trigger can be activated. 
     * @param trigger
     */
    public canActivateTrigger(trigger: ITriggerDefinition): boolean {
        if (!trigger || !trigger.questId) {
            return false;
        }

        //  check if trigger depends on quest 
        if (Array.isArray(trigger.dependsOn)) {
            for (var i = 0; i < trigger.dependsOn.length; i++) {
                let dependency = trigger.dependsOn[i];
                let state = this.questState[dependency];
                if (!state || state != QuestState.Rewarded)
                    return false;
            }
        }

        let TEN_SECONDS = 10000;
        let nextAllowedTime = (trigger.lastActive || -TEN_SECONDS) + TEN_SECONDS;
        return nextAllowedTime < performance.now();
    }

    /**
     * Handles level events triggers.
     * @param body
     */
    public handleTriggerEvent(body: any): void {
        let scm = Global.getScm();
        var trigger: ITriggerDefinition = body.Trigger;

        //  note: trigger can have a predefined state (so we skip previous states)
        let state = Math.max(this.getQuestState(trigger.questId), trigger.state || 0);

        // react only if trigger has quest id and last active is older than 10 seconds 
        if (this.canActivateTrigger(trigger)) {
            trigger.lastActive = performance.now();

            let quest: Quest = this.findQuest(trigger.questId);

            switch (trigger.questId) {
                case 1: //   intro
                    if (state === QuestState.None) {

                        this.setQuestState(trigger.questId, QuestState.Completed);
                        this.gameScene.IsHeroInteractive = false;

                        this.hud.setQuestMessage(quest.welcomeMsg, 4000, () => {
                            this.hud.setQuestMessage(quest.completedMsg, 4000, () => {
                                this.gameScene.IsHeroInteractive = true;
                                this.setQuestState(trigger.questId, QuestState.Finished);
                                this.giveRewards(quest);

                                this.setQuestState(trigger.questId + 1, QuestState.InProgress);
                                quest = this.findQuest(trigger.questId + 1);
                                this.hud.setQuestMessage(quest.welcomeMsg, 4000);
                            });
                        });
                    }
                    break;

                case 2: //  intro - jump on box task
                    if (this.getQuestState(1) > QuestState.Finished) {
                        if (state === QuestState.InProgress) {
                            this.setQuestState(trigger.questId, QuestState.Completed);
                            this.gameScene.IsHeroInteractive = false;
                            this.hud.setQuestMessage(quest.completedMsg, 4000, () => {
                                this.gameScene.IsHeroInteractive = true;
                                this.setQuestState(trigger.questId, QuestState.Finished);
                                this.giveRewards(quest);

                                //  start quest 3
                                quest = this.findQuest(trigger.questId + 1);
                                this.setQuestState(trigger.questId + 1, QuestState.InProgress);
                                this.hud.setQuestMessage(quest.welcomeMsg);
                            });
                        } else if (state >= QuestState.Finished) {
                            quest = this.findQuest(trigger.questId + 1);
                            this.hud.setQuestMessage(quest.welcomeMsg, 4000);
                        }
                    }
                    break;

                case 3: //  intro - exit sign                                           
                    if (state === QuestState.InProgress) {
                        this.setQuestState(trigger.questId, QuestState.Finished);
                        this.giveRewards(quest);
                        this.gameScene.IsHeroInteractive = false;
                        this.hud.setQuestMessage(quest.completedMsg, 4000, () => {
                            Global.getScm().ActivateScene("Loader");
                        });
                        stats.saveUserState(true);
                        snd.win();
                    }
                    break;

                case 201:   //  Kendo knowledge
                    this.genericQuestHandler(quest, state, body, [
                        () => {
                            let item = Global.worldContainer.getChildByName("quest_item_201");
                            item.visible = true;
                            var lock: any = this.findBodyByName("lock");
                            this.gameScene.removeEntity(lock, true);
                        },
                        () => { },
                        () => {
                            this.setQuestState(trigger.questId, QuestState.Finished);
                            this.giveRewards(quest);
                            this.gameScene.IsHeroInteractive = false;

                            stats.saveUserState(true);

                            snd.win();
                            this.hud.visible = false;
                            var cs = scm.GetScene("CutScene") as CutScene;
                            cs.SetText(quest.finishedMsg, QUEST_STYLE);
                            var rt = scm.CaptureScene();
                            cs.SetBackGround(rt, this.gameScene.scale);
                            scm.ActivateScene(cs);
                        }
                    ]);
                    break;

                // case 202:   //  seek the hanshi Kendo master
                //     this.genericQuestHandler(quest, state, body);
                //     break;

                case 203:   //  hanshi Kendo master dojo: collect 10 ki
                    this.genericQuestHandler(quest, state, body, [
                        () => { stats.HasJumpAtack = true; },
                        () => { },
                        () => { },
                        () => { }
                    ]);
                    break;

                // case 204:   //  hanshi Kendo master dojo: collect 25 ki
                //     this.genericQuestHandler(quest, state, body);
                //     break;

                default:
                    this.genericQuestHandler(quest, state, body);
                    break;
            }
        }
    }

    /**
     * 
     * @param quest 
     * @param state 
     * @param body the physics sensor or trigger that causes this quest
     * @param actions array of actions (one optional action for each state)
     */
    private genericQuestHandler(quest: Quest, state: QuestState, body, actions?: Array<() => void>) {
        let trigger: ITriggerDefinition = body.Trigger;
        switch (state) {
            case QuestState.None:
                this.setQuestState(quest.id, QuestState.InProgress);
                this.hud.setQuestMessage(quest.welcomeMsg);
                break;
            case QuestState.InProgress:
                this.hud.setQuestMessage(quest.objectiveMsg);
                break;
            case QuestState.Completed:
                if (quest.itemId && quest.itemsCollected >= quest.itemsNeeded) { //  if the acquireItem has set quest to completed move to next stated
                    this.setQuestState(quest.id, QuestState.Finished);
                    trigger.lastActive = 0;
                } else {
                    this.hud.setQuestMessage(quest.completedMsg);
                }
                break;
            case QuestState.Finished:
                this.hud.setQuestMessage(quest.finishedMsg);
                this.giveRewards(quest);
                this.gameScene.removeEntity(body, true); // remove the sensor from physics and the displayobject from scene
                break;
        }
        if (actions && actions[state]) {
            actions[state]();
        }
    }

    private giveRewards(quest: Quest) {
        snd.questItem();
        if (quest.rewardExp) {
            stats.increaseStat(StatType.TotalExp, quest.rewardExp);
            // let pt = new PIXI.Point(Global.position.x, Global.position.y + 50);
            // this.hud.addInfoMessage(pt, `+${quest.rewardExp} exp`, MSG_EXP_STYLE);
        }
        if (quest.rewardCoins) {
            stats.increaseStat(StatType.Coins, quest.rewardCoins);
            // let pt = new PIXI.Point(Global.position.x + 50, Global.position.y + 100);
            // this.hud.addInfoMessage(pt, `+${quest.rewardCoins} coins`);
        }
        this.setQuestState(quest.id, QuestState.Rewarded);
    }

    private findQuest(questId: number): Quest {
        var quests = Global.LevelDefinitions.quests.filter((q) => {
            return q.id === questId;
        });
        var quest: Quest = quests[0];
        return quest;
    }

    private findQuestWithItem(itemId: number): Quest {
        var quests = Global.LevelDefinitions.quests.filter((q: Quest) => {
            if (q.itemId === itemId) {
                let state = this.getQuestState(q.id);
                return state < QuestState.Completed && state > QuestState.None;
            }
            return false;
        });
        if (quests.length > 0) {
            return quests[0];
        } else {
            return null;
        }
    }

    /**
    * Sets the quest state.
    */
    private setQuestState(questId: number, state: QuestState) {
        this.questState[questId] = state;
    }

    /**
     * Gets the quest state.
     */
    private getQuestState(questId: number): QuestState {
        return this.questState[questId] || QuestState.None;
    }

    /**
     * Finds a body with the given display objects name.
     * @param name
     */
    private findBodyByName(name: string): p2.Body {
        var foundBody = undefined;
        wp2.bodies.forEach((body: any) => {
            var dispObj = body.DisplayObject as PIXI.DisplayObject;
            if (dispObj && dispObj.name === name) {
                foundBody = body;
            }
        });
        return foundBody;
    }
}

