import { v4 as uuidv4 } from 'uuid';
import { Component, DoCheck, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import AgoraRTM, { RtmChannel, RtmClient } from 'agora-rtm-sdk';

var RTMChannel: RtmChannel;

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  appId = 'fe150a2dd676412585c762ed6453b61b'
  RTMClient: RtmClient;

  opponentMid: string = ''
  playerType: string = ''
  status = 'idle'
  channelName = ''


  constructor(private route: ActivatedRoute) {
    this.RTMClient = AgoraRTM.createInstance(this.appId)
  }

  ngOnInit(): void { }

  createChannel() {
    RTMChannel = this.RTMClient.createChannel(String(this.channelName).toLowerCase())
    this.RTMClient.login({ uid: uuidv4() }).then(() => {
      RTMChannel.join().then(() => {
        this.status = 'waiting'
        RTMChannel.getMembers().then((m) => {
          if (m.length == 2) {
            this.opponentMid = m[1]
            this.playerType = 'remote'
            this.status = 'started'
          } else if (m.length > 2) {
            this.status = 'interrupted by 3rd person'
            console.log(m)
          }
        })
      })
    })
    this.setUpChannel()
  }

  setUpChannel() {
    RTMChannel.on('MemberJoined', (mId) => {
      console.log('mid joined>', mId);
      RTMChannel.getMembers().then((m) => {
        if (m.length == 2) {
          this.opponentMid = mId
          this.status = 'started'
          this.playerType = 'local'
        } else if (m.length > 2) {
          this.status = 'interrupted by 3rd person'
          console.log(m)
        }
      })
    })

    this.RTMClient.on('MessageFromPeer', (message, mId) => {
      let msg = JSON.parse(message.text + '')
      console.log(msg);
      if (msg.turn) {
        this.boardArray = msg.boardArray
        this.turn = msg.turn
        this.nextTurn = msg.nextTurn
        this.updatePawn = msg.updatePawn
        this.isKingCheckeded = msg.isKingCheckeded
        this.lastClickedPosition = msg.lastClickedPosition
      } else {
        console.log(message);
        console.log('didnt parse');
      }
    })

    RTMChannel.on('MemberLeft', (mId) => {
      console.log('mid left > ', mId);
      if (mId == this.opponentMid) {
        this.status = "opponenet left"
      }
    })
  }

  pingOpponent() {
    let msg = JSON.stringify({
      boardArray: this.boardArray,
      turn: this.turn,
      nextTurn: this.nextTurn,
      updatePawn: this.updatePawn,
      isKingCheckeded: this.isKingCheckeded,
      lastClickedPosition: this.lastClickedPosition
    })

    this.RTMClient.sendMessageToPeer({ text: msg }, this.opponentMid).then(() => {
      console.log('ping from ' + this.opponentMid);
    }).catch(() => {
      console.log('unable to ping from ' + this.opponentMid);
    })

  }

  ngOnDestroy(): void { this.leave() }

  leave() {
    RTMChannel?.leave().then((e) => {
      console.log('left ');
      this.status = "idle"
    }).then(async () => {
      await this.RTMClient.logout()
      location.reload()
    })

  }

  ///chessx
  bp: string = "assets/black/blackpawn.jpg";
  bk: string = "assets/black/blackking.jpg";
  bq: string = "assets/black/blackqueen.jpg";
  bc: string = "assets/black/blackcamel.jpg";
  bh: string = "assets/black/blackhorse.jpg";
  be: string = "assets/black/blackele.jpg";
  em: string = "";
  empObj = { src: "", pieceType: "", addCls: "", playerType: "e" };
  blackQueenObj = { src: this.bq, pieceType: "queen", addCls: "", playerType: "b" };
  whiteQueenObj = { src: this.bq, pieceType: "queen", addCls: "", playerType: "w" };
  disableUndoBtn: any = true;
  turn: string = "w";
  nextTurn: string = "b";
  updatePawn = false;
  isKingCheckeded = false;

  recover: any = {
    i: -1,
    j: -1,
    k: -1,
    l: -1,
    obj: { src: "", pieceType: "", addCls: "", playerType: "" }
  };

  boardArray = [
    [
      { src: this.be, pieceType: "ele", addCls: "", playerType: "b" },
      { src: this.bh, pieceType: "horse", addCls: "", playerType: "b" },
      { src: this.bc, pieceType: "camel", addCls: "", playerType: "b" },
      { src: this.bk, pieceType: "king", addCls: "", playerType: "b" },
      { src: this.bq, pieceType: "queen", addCls: "", playerType: "b" },
      { src: this.bc, pieceType: "camel", addCls: "", playerType: "b" },
      { src: this.bh, pieceType: "horse", addCls: "", playerType: "b" },
      { src: this.be, pieceType: "ele", addCls: "", playerType: "b" },
    ],
    [
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "b" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "b" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "b" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "b" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "b" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "b" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "b" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "b" },
    ],
    [
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
    ],
    [
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
    ],
    [
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
    ],
    [
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
      { src: "", pieceType: "", addCls: "", playerType: "e" },
    ],
    [
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "w" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "w" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "w" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "w" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "w" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "w" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "w" },
      { src: this.bp, pieceType: "pawn", addCls: "", playerType: "w" },
    ],
    [
      { src: this.be, pieceType: "ele", addCls: "", playerType: "w" },
      { src: this.bh, pieceType: "horse", addCls: "", playerType: "w" },
      { src: this.bc, pieceType: "camel", addCls: "", playerType: "w" },
      { src: this.bk, pieceType: "king", addCls: "", playerType: "w" },
      { src: this.bq, pieceType: "queen", addCls: "", playerType: "w" },
      { src: this.bc, pieceType: "camel", addCls: "", playerType: "w" },
      { src: this.bh, pieceType: "horse", addCls: "", playerType: "w" },
      { src: this.be, pieceType: "ele", addCls: "", playerType: "w" },
    ]
  ];

  lastClickedPosition: number[] = [-1, 0];
  saveLastClickedPosition(i: number, j: number) {
    this.lastClickedPosition[0] = i;
    this.lastClickedPosition[1] = j;
  }
  resetLastClickedPosition() {
    this.lastClickedPosition[0] = -1;
    this.lastClickedPosition[1] = 0;
  }
  markPieceSelected(i: number, j: number) {
    this.boardArray[i][j].addCls = "selected";
  }
  removeAddCls(i: number, j: number) {
    this.boardArray[i][j].addCls = "";
  }
  //conditions 1///
  checkTurnNselectedPiece(i: number, j: number): boolean {
    return this.turn == this.boardArray[i][j].playerType
  }
  //conditions 2///
  canMove(i: number, j: number): boolean {
    return this.boardArray[i][j].addCls == "moveOpt"
  }
  savePieceToRecoveryObj(i: number, j: number) {
    this.recover.obj.src = this.boardArray[i][j].src;
    this.recover.obj.playerType = this.boardArray[i][j].playerType;
    this.recover.obj.pieceType = this.boardArray[i][j].pieceType;
    this.recover.obj.addCls = this.boardArray[i][j].addCls;
  }
  savePositionsToRecoveryObj(i: number, j: number, k: number, l: number) {
    this.recover.i = i;
    this.recover.j = j;
    this.recover.k = k;
    this.recover.l = l;
  }
  clearAllMoves(clearCheck: boolean = false) {
    let cls = clearCheck ? "" : "kingChecked"
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        this.boardArray[i][j].addCls =
          (this.boardArray[i][j].addCls == "selected" || this.boardArray[i][j].addCls == cls)
            ? this.boardArray[i][j].addCls : "";
      }
    }
  }
  changeTurn() {
    this.turn = this.turn == "w" ? "b" : "w";
    this.nextTurn = this.nextTurn == "w" ? "b" : "w";
  }
  moveSelectedPiece(i: number, j: number, k: number, l: number) {
    this.boardArray[i][j].src = this.boardArray[k][l].src;
    this.boardArray[i][j].playerType = this.boardArray[k][l].playerType;
    this.boardArray[i][j].pieceType = this.boardArray[k][l].pieceType;
    this.boardArray[i][j].addCls = this.boardArray[k][l].addCls;
  }
  fillWith(i: number, j: number, obj: any) {
    this.boardArray[i][j].src = obj.src;
    this.boardArray[i][j].playerType = obj.playerType;
    this.boardArray[i][j].pieceType = obj.pieceType;
    this.boardArray[i][j].addCls = obj.addCls;
  }
  markKingChecked() {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (this.boardArray[x][y].src == this.bk && this.boardArray[x][y].playerType == this.turn)
          this.boardArray[x][y].addCls = "kingChecked";
      }
    }
  }
  //^\\
  //////|\\\\\\ checked and refactored
  move(clickedPositionI: number, clickedPositionJ: number): any {
    if (this.checkTurnNselectedPiece(clickedPositionI, clickedPositionJ)) {
      if (this.lastClickedPosition[0] == -1) {
        this.disableUndoBtn = true;
      } else {
        this.removeAddCls(this.lastClickedPosition[0], this.lastClickedPosition[1]);
        this.isKingCheckeded && this.markKingChecked();
      }
      this.saveLastClickedPosition(clickedPositionI, clickedPositionJ);
      this.markPossibleMoves(clickedPositionI, clickedPositionJ);
      this.markPieceSelected(clickedPositionI, clickedPositionJ);
    }
    else if (this.canMove(clickedPositionI, clickedPositionJ)) {
      let lastClickedPositioI = this.lastClickedPosition[0];
      let lastClickedPositioJ = this.lastClickedPosition[1];
      this.isKingCheckeded = false;
      this.removeAddCls(clickedPositionI, clickedPositionJ);
      this.removeAddCls(lastClickedPositioI, lastClickedPositioJ);
      this.savePieceToRecoveryObj(clickedPositionI, clickedPositionJ);
      this.moveSelectedPiece(clickedPositionI, clickedPositionJ, lastClickedPositioI, lastClickedPositioJ);

      // UpgratePieceType
      if (this.updatePawn) {
        this.updatePawn = false;
        if (this.turn == "w") {
          this.fillWith(clickedPositionI, clickedPositionJ, this.whiteQueenObj);
        } else
          this.fillWith(clickedPositionI, clickedPositionJ, this.blackQueenObj);
      }
      // UpgratePieceType

      this.fillWith(lastClickedPositioI, lastClickedPositioJ, this.empObj);
      this.savePositionsToRecoveryObj(clickedPositionI, clickedPositionJ, lastClickedPositioI, lastClickedPositioJ);
      this.resetLastClickedPosition()
      this.clearAllMoves(true);
      this.disableUndoBtn = false;
      this.changeTurn();
      this.findKIng();

      this.pingOpponent()
    }
  }

  // to be checked and refactored
  markPossibleMoves(i: number, j: number) {
    this.clearAllMoves();
    // pawn 
    if (this.boardArray[i][j].src == this.bp) {
      let steps = -1;
      if (this.boardArray[i][j].playerType == "b") {
        steps = 1;
      }
      if (this.boardArray[i + steps]?.[j]?.playerType == "e") {
        if (!this.dhundo((i + steps), (j), i, j)) {
          this.boardArray[i + steps][j].addCls = "moveOpt";
          if (i + steps == 0 || i + steps == 7) { this.updatePawn = true; } else { this.updatePawn = false; }
        }
        if ((i == 1 && this.turn == "b") || (i == 6 && this.turn == "w")) {
          if (this.boardArray[i + (steps * 2)][j].playerType == "e") {
            if (!this.dhundo((i + (steps * 2)), (j), i, j)) {
              this.boardArray[i + (steps * 2)][j].addCls = "moveOpt";
            }
          }
        }
      }
      if (this.boardArray[i + steps]?.[j + 1]?.playerType == this.nextTurn) {
        if (!this.dhundo((i + steps), (j + 1), i, j)) {
          this.boardArray[i + steps][j + 1].addCls = "moveOpt";
          if (i + steps == 0 || i + steps == 7) { this.updatePawn = true; } else { this.updatePawn = false; }
        }
      }
      if (this.boardArray[i + steps]?.[j - 1]?.playerType == this.nextTurn) {
        if (!this.dhundo((i + steps), (j - 1), i, j)) {
          this.boardArray[i + steps][j - 1].addCls = "moveOpt";
          if (i + steps == 0 || i + steps == 7) { this.updatePawn = true; } else { this.updatePawn = false; }
        }
      }
    }
    // camel 
    else if (this.boardArray[i][j].src == this.bc) {
      this.chkOpt(i, j, 1, 1);
      this.chkOpt(i, j, 1, -1);
      this.chkOpt(i, j, -1, -1);
      this.chkOpt(i, j, -1, 1);
    }
    // ele 
    else if (this.boardArray[i][j].src == this.be) {
      this.chkOpt(i, j, 1, 0);
      this.chkOpt(i, j, -1, 0);
      this.chkOpt(i, j, 0, -1);
      this.chkOpt(i, j, 0, 1);
    }
    // queen 
    else if (this.boardArray[i][j].src == this.bq) {
      this.chkOpt(i, j, 1, 1);
      this.chkOpt(i, j, 1, -1);
      this.chkOpt(i, j, -1, -1);
      this.chkOpt(i, j, -1, 1);
      this.chkOpt(i, j, 1, 0);
      this.chkOpt(i, j, -1, 0);
      this.chkOpt(i, j, 0, -1);
      this.chkOpt(i, j, 0, 1);
    }
    // king 
    else if (this.boardArray[i][j].src == this.bk) {
      this.chkOpt(i, j, 1, 1);
      this.chkOpt(i, j, 1, -1);
      this.chkOpt(i, j, -1, -1);
      this.chkOpt(i, j, -1, 1);
      this.chkOpt(i, j, 1, 0);
      this.chkOpt(i, j, -1, 0);
      this.chkOpt(i, j, 0, -1);
      this.chkOpt(i, j, 0, 1);
    }
    // horse 
    else if (this.boardArray[i][j].src == this.bh) {
      this.chkOpt(i, j, 2, 1);
      this.chkOpt(i, j, 2, -1);
      this.chkOpt(i, j, -2, -1);
      this.chkOpt(i, j, -2, 1);
      this.chkOpt(i, j, 1, 2);
      this.chkOpt(i, j, 1, -2);
      this.chkOpt(i, j, -1, -2);
      this.chkOpt(i, j, -1, 2);
    }
    // error 
    else {
      alert("error error....... in markPossibleMoves")
    }
  }
  // options for selecteded piece 
  chkOpt(i: number, j: number, stpI: number, stpJ: number) {
    let ind = 1;

    while (this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == "e" || this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == this.nextTurn) {
      if (this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == this.nextTurn) {
        if (!this.dhundo((i + (stpI * ind)), (j + (stpJ * ind)), i, j)) {
          // this.dhundo((i + (stpI * ind)), (j + (stpJ * ind)), i, j);
          this.boardArray[i + (stpI * ind)][j + (stpJ * ind)].addCls = "moveOpt";
          break;
        }
      } else {
        if (!this.dhundo((i + (stpI * ind)), (j + (stpJ * ind)), i, j)) {
          //  this.dhundo((i + (stpI * ind)), (j + (stpJ * ind)), i, j);
          this.boardArray[i + (stpI * ind)][j + (stpJ * ind)].addCls = "moveOpt";
        }
      }
      if (this.boardArray[i][j].src == this.bk || this.boardArray[i][j].src == this.bh) {
        break;
      }
      ind++;
    }
  }

  dhundo(oi: number, oj: number, pi: number, pj: number): any {
    let i = -1, j = -1;
    if (this.boardArray[pi]?.[pj]?.src != this.bk) {
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          if (this.boardArray[x][y].src == this.bk && this.boardArray[x][y].playerType == this.turn) {
            i = x; j = y;
            break;
          }
          // console.log(x+""+y);
        }
      }
    } else {
      i = oi; j = oj;
      // cros  X straight combo////////////////////////////////////////////////////////////////////////////////////
      if (this.ckhCheck(i, j, -1, 1, oi, oj, pi, pj, 1, this.bk)) { console.log("ival"); return true; };
      if (this.ckhCheck(i, j, 1, 1, oi, oj, pi, pj, 1, this.bk)) { console.log("ival"); return true; };
      if (this.ckhCheck(i, j, -1, -1, oi, oj, pi, pj, 1, this.bk)) { console.log("ival"); return true; };
      if (this.ckhCheck(i, j, 1, -1, oi, oj, pi, pj, 1, this.bk)) { console.log("ival"); return true; };
      if (this.ckhCheck(i, j, -1, 0, oi, oj, pi, pj, 1, this.bk)) { console.log("ival"); return true; };
      if (this.ckhCheck(i, j, 0, 1, oi, oj, pi, pj, 1, this.bk)) { console.log("ival"); return true; };
      if (this.ckhCheck(i, j, 0, -1, oi, oj, pi, pj, 1, this.bk)) { console.log("ival"); return true; };
      if (this.ckhCheck(i, j, 1, 0, oi, oj, pi, pj, 1, this.bk)) { console.log("ival"); return true; };
    }

    // cross directions  ////////////////////////////////////////////////////////////////////////////////////////
    if (this.ckhCheck(i, j, -1, 1, oi, oj, pi, pj, -1, this.bc, this.bq)) { console.log("ival"); return true; };
    if (this.ckhCheck(i, j, 1, 1, oi, oj, pi, pj, -1, this.bc, this.bq)) { console.log("ival"); return true; };
    if (this.ckhCheck(i, j, -1, -1, oi, oj, pi, pj, -1, this.bc, this.bq)) { console.log("ival"); return true; };
    if (this.ckhCheck(i, j, 1, -1, oi, oj, pi, pj, -1, this.bc, this.bq)) { console.log("ival"); return true; };

    // straight directions //////////////////////////////////////////////////////////////////////////////////////
    if (this.ckhCheck(i, j, -1, 0, oi, oj, pi, pj, -1, this.be, this.bq)) { console.log("ival"); return true; };
    if (this.ckhCheck(i, j, 0, 1, oi, oj, pi, pj, -1, this.be, this.bq)) { console.log("ival"); return true; };
    if (this.ckhCheck(i, j, 0, -1, oi, oj, pi, pj, -1, this.be, this.bq)) { console.log("ival"); return true; };
    if (this.ckhCheck(i, j, 1, 0, oi, oj, pi, pj, -1, this.be, this.bq)) { console.log("ival"); return true; };

    // horse chk ////////////////////////////////////////////////////////////////////////////////////////////////
    if (this.ckhCheck(i, j, 2, 1, oi, oj, pi, pj, 1, this.bh)) { console.log("ival"); return true; };
    if (this.ckhCheck(i, j, 2, -1, oi, oj, pi, pj, 1, this.bh)) { console.log("ival"); return true; };
    if (this.ckhCheck(i, j, -2, 1, oi, oj, pi, pj, 1, this.bh)) { console.log("ival"); return true; };
    if (this.ckhCheck(i, j, -2, -1, oi, oj, pi, pj, 1, this.bh)) { console.log("ival"); return true; };
    if (this.ckhCheck(i, j, 1, 2, oi, oj, pi, pj, 1, this.bh)) { console.log("ival"); return true; };
    if (this.ckhCheck(i, j, -1, 2, oi, oj, pi, pj, 1, this.bh)) { console.log("ival"); return true; };
    if (this.ckhCheck(i, j, 1, -2, oi, oj, pi, pj, 1, this.bh)) { console.log("ival"); return true; };
    if (this.ckhCheck(i, j, -1, -2, oi, oj, pi, pj, 1, this.bh)) { console.log("ival"); return true; };
    // pyada /////////////////////////////////////////////////////////////////////////////////////
    if (this.turn == "w") {
      if (this.ckhCheck(i, j, -1, 1, oi, oj, pi, pj, 1, this.bp)) { console.log("ival"); return true; };
      if (this.ckhCheck(i, j, -1, -1, oi, oj, pi, pj, 1, this.bp)) { console.log("ival"); return true; };
    }
    if (this.turn == "b") {
      if (this.ckhCheck(i, j, 1, 1, oi, oj, pi, pj, 1, this.bp)) { console.log("ival"); return true; };
      if (this.ckhCheck(i, j, 1, -1, oi, oj, pi, pj, 1, this.bp)) { console.log("ival"); return true; };
    }
  }

  findKIng() {
    let i = -1, j = -1;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (this.boardArray[x][y].src == this.bk && this.boardArray[x][y].playerType == this.turn) {
          i = x; j = y;
          break;
        }
      }
    }
    this.ckhKing(i, j, 1, 1, -1, this.bc, this.bq)
    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, 1, -1, -1, this.bc, this.bq);

    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, -1, 1, -1, this.bc, this.bq);
    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, -1, -1, -1, this.bc, this.bq);

    if (this.turn == 'w') {
      if (this.boardArray[i][j].addCls != "kingChecked")
        this.ckhKing(i, j, -1, 1, 1, this.bp);
      if (this.boardArray[i][j].addCls != "kingChecked")
        this.ckhKing(i, j, -1, -1, 1, this.bp);
    } else {
      if (this.boardArray[i][j].addCls != "kingChecked")
        this.ckhKing(i, j, 1, 1, 1, this.bp);
      if (this.boardArray[i][j].addCls != "kingChecked")
        this.ckhKing(i, j, 1, -1, 1, this.bp);
    }

    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, 2, 1, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, 2, -1, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, -2, -1, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, -2, 1, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, 1, 2, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, 1, -2, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, -1, -2, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, -1, 2, 1, this.bh);

    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, 0, -1, -1, this.be, this.bq);
    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, 0, 1, -1, this.be, this.bq);
    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, 1, 0, -1, this.be, this.bq);
    if (this.boardArray[i][j].addCls != "kingChecked")
      this.ckhKing(i, j, -1, 0, -1, this.be, this.bq);
  }

  ckhCheck(i: number, j: number, stpI: number, stpJ: number, oi: number, oj: number, pi: number, pj: number, count: number, ...chkFor: any): any {
    let posVal = -1;
    let ind = 1;
    while (this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == "e" || this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == "w" || this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == "b") {
      if (this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == "e") {
        if ((i + (stpI * ind)) == oi && (j + (stpJ * ind)) == oj) {
          break;
        } else {
          if (ind == count) { break; } ind++;
          continue;
        }
      }
      if (this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == this.turn) {
        if ((i + (stpI * ind)) == pi && (j + (stpJ * ind)) == pj) {
          if (ind == count) { break; } ind++; continue;
        } else { break; }
      }
      if (this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.src == chkFor[0] || this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.src == chkFor[1] || this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.src == chkFor[2]) {
        if ((i + (stpI * ind)) == oi && (j + (stpJ * ind)) == oj) {
          break;
        }
        return "invalid!!";
      } else {
        break;
      }

    }
  }

  ckhKing(i: number, j: number, stpI: number, stpJ: number, count: number, ...chkFor: any): any {
    let ind = 1;
    while (this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == "e" || this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == this.nextTurn) {
      if (this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.src == chkFor[0] || this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.src == chkFor?.[1]) {
        this.boardArray[i][j].addCls = "kingChecked"; this.isKingCheckeded = true;
      } else if (!(this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == "e")) {
        break;
      }

      if (ind == count) {
        break;
      }
      ind++;
    }
  }
  /////undo////// undo update pawn to fix 
  undo() {
    this.clearAllMoves();
    this.moveSelectedPiece(this.recover.k, this.recover.l, this.recover.i, this.recover.j);
    this.fillWith(this.recover.i, this.recover.j, this.recover.obj);
    this.changeTurn()
    this.disableUndoBtn = true;
    this.resetLastClickedPosition()
    this.findKIng();
  }
}