export interface boardPiece {
    src: string
    pieceType: string
    addCls: string
    playerType: "b" | "w" | "e";
}
export interface RipBoardPiece {
    src: string
    pieceType: string
    playerType: "b" | "w" | "e"
    count: number
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
    ripPiecesArr: RipBoardPiece[]
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

export interface statusType {
    code: number,
    message: string
}

export enum gameIdle {
    code = 1,
    message = 'idle'
}
export enum gameWaiting {
    code = 2,
    message = 'waiting'
}
export enum gameStarted {
    code = 3,
    message = 'started'
}
export enum gameLeft {
    code = 4,
    message = 'left'
}
export enum gameInterrupted {
    code = 5,
    message = 'interrupted'
}