
export enum QuestState {
    None,

    /**
     *  Quest has been started.
     */
    InProgress,

    /**
     *  Quest items/conditions have been completed.
     */
    Completed,

    /**
     *  Quest has been finished.
     */
    Finished,

    /**
     *  Quest has been finished and reward awarded.
     */
    Rewarded,
}