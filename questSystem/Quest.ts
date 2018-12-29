import { QuestState } from "./QuestState";

export class Quest {

    public id: number;
    public welcomeMsg: string;
    public objectiveMsg: string;
    public completedMsg: string;
    public finishedMsg: string;
    public state: QuestState = QuestState.None;

    /**
     * Item's interaction type, used only for item collect quests.
     */
    public itemId: number;

    /**
     * Number of items needed to finish the quest.
     */
    public itemsNeeded: number;

    /**
     * Number of items collected, used only for item collect quests.
     */
    public itemsCollected: number;

    public rewardExp: number;
    public rewardCoins: number;
}