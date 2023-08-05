export interface boardPiece {
    src: string
    pieceType: string
    addCls: string
    playerType: string;
}
export interface remotePlayerType {
    mid: string,
    userName: string
}
export interface localPlayerType {
    userName: string
}
export interface messageObjType<T> {
    type: messageType
    data: T
}
export enum messageType {
    pingBoardChanges,
    pingUserName,
    pingChatMessage,
    pingGameReset
}
export interface pingBoardChangesMessageType {
    boardArray: boardPiece[][]
    turn: string
    nextTurn: string
    updatePawn: boolean
    isKingCheckeded: boolean
    lastClickedPosition: number[]
}
export interface pingUserNameMessageType {
    username: string
}
export interface chatMessage {
    side: "local" | "remote",
    message: string
}
export interface pingChatMessageType {
    side: "local" | "remote",
    message: string
}