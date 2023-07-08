import { Component, DoCheck, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  /// connection variables
  @ViewChild('hhh') hhh: ElementRef<HTMLButtonElement> | null = null;
  refresh = 0;
  client = 'offer'
  refreshP() { this.refresh += 1 }

  offerConnectionStatus = false;
  remoteConnectionStatus = false;

  offer: any = null;
  remoteOffer: any = null;
  answer: any = null;
  remoteAnswer: RTCSessionDescriptionInit | null = null;

  offerChannel: RTCDataChannel | null = null;
  remoteChannel: RTCDataChannel | null = null;

  remoteConnection: RTCPeerConnection | null = null;
  localConnection: RTCPeerConnection | null = null;

  constructor(private route: ActivatedRoute) {
    let c = this.route.snapshot.queryParamMap.get('client')
    let o = this.route.snapshot.queryParamMap.get('offer')
    console.log(o)
    if (c == 'remote' && o) {
      this.client = c
      try {
        o = atob(o)
        console.log(o)
        this.remoteOffer = JSON.parse(o)
        this.generateAnswer()
      } catch {
        alert('invalid url p')
      }
      console.log(this.remoteOffer)
    } else if (c == 'offer') {

    } else {
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.closeConnection()
  }

  saveRemoteOffer(res: any) {
    console.log('saved offer')
    this.remoteOffer = JSON.parse(res.target.value)
  }

  saveRemoteAnswer(res: any) {
    console.log('saved answer')
    this.remoteAnswer = JSON.parse(res.target.value)
  }

  // step 1 L
  initRtc() {
    this.localConnection = new RTCPeerConnection()
    this.setUpLocalChannel()

    this.localConnection.onicecandidate = (a) => {
      if (this.localConnection) {
        let offerObj = JSON.stringify(this.localConnection.localDescription);
        offerObj = btoa(offerObj)
        this.offer = 'http://localhost:4200/board/default?client=remote&offer=' + offerObj
      } else {
        throw new Error("unable to save localDescription on localConnection :=> initRtc > onicecandidate")
      }
      this.hhh?.nativeElement.click()
    }

    this.localConnection.createOffer().then((o: RTCSessionDescriptionInit) => {
      if (this.localConnection) {
        this.localConnection.setLocalDescription(o).then((a: any) => {
          console.log("localConnection LocalDescription set")
        }).catch((re: any) => {
          console.log(re)
        })
      } else {
        throw new Error("unable to set localDescription on localConnection :=> initRtc > createOffer")
      }
    }).catch((re: any) => { console.log(re) }).then(() => {
      console.log('done');
    })
  }

  // step 2 L
  setUpLocalChannel() {
    if (this.localConnection) {
      this.offerChannel = this.localConnection.createDataChannel("dataChannel");

      this.offerChannel.onmessage = (e: any) => {
        if (e?.data) {
          let data = JSON.parse(e?.data);
          this.turn = data.turn
          this.boardArray = data.arr
        } else {
          throw new Error("unable to read data onmessage on localConnection :=> setUpLocalChannel > onmessage ")
        }
        this.hhh?.nativeElement.click()
      }

      this.offerChannel.onopen = (a) => {
        console.log("open!!!!")
        this.offerConnectionStatus = true;
        this.hhh?.nativeElement.click();
      };

      this.offerChannel.onclose = (a) => {
        console.log("closed!!!!!!")
        this.offerConnectionStatus = false;
      };
    } else {
      throw new Error("unable to setUpLocalChannel on localConnection :=> setUpLocalChannel")
    }
  }

  // step 3 R
  generateAnswer() {
    this.remoteConnection = new RTCPeerConnection()
    this.setUpRemoteChannel()

    this.remoteConnection.onicecandidate = (a) => {
      if (this.remoteConnection) {
        this.answer = this.remoteConnection.localDescription;
      } else {
        throw new Error("unable to save localDescription on remoteConnection :=> generateAnswer > onicecandidate")
      }
      this.hhh?.nativeElement.click()
    }

    if (this.remoteOffer) {
      this.remoteConnection.setRemoteDescription(this.remoteOffer).then((a: any) => {
        console.log("remoteConnection RemoteDescription set 3")
      }).catch((re: any) => {
        console.log(re)
      })

      this.remoteConnection.createAnswer().then((a: any) => {
        this.remoteConnection?.setLocalDescription(a).then((a: any) => {
          console.log("remoteConnection setLocalDescription set 3")
        }).catch((re: any) => {
          console.log(re)
        })
      }).then(() => { console.log('answer created 3') }).catch((re: any) => {
        console.log(re)
      })
    } else {
      alert('offer not set')
    }
  }

  // step 4 R
  setUpRemoteChannel() {
    if (this.remoteConnection) {
      this.remoteConnection.ondatachannel = (e: RTCDataChannelEvent) => {
        this.remoteChannel = e.channel;

        this.remoteChannel.onmessage = (e: any) => {
          if (e.data) {
            let data = JSON.parse(e.data);
            this.turn = data.turn
            this.boardArray = data.arr
          } else {
            throw new Error("unable to read data onmessage on remoteConnection :=> setUpRemoteChannel > onmessage ")
          }
          this.hhh?.nativeElement.click()
        }

        this.remoteChannel.onopen = (a) => {
          console.log("open!!!!")
          this.remoteConnectionStatus = true;
          this.hhh?.nativeElement.click();
        };

        this.remoteChannel.onclose = (a) => {
          console.log("closed!!!!!!")
          this.remoteConnectionStatus = false;
        };
      }
    } else {
      throw new Error("unable to setUpRemoteChannel on remoteConnection :=> setUpRemoteChannel")
    }
  }

  //final step 5 L
  localConnect() {
    if (this.remoteAnswer != null) {
      this.localConnection?.setRemoteDescription(this.remoteAnswer).then(() => {
        console.log("connection in progress")
      }).catch((re: any) => {
        console.log(re)
      })
    } else {
      alert('invalid remote ans')
    }
  }

  // all set 

  // send from local 
  offerChannelSender() {
    this.offerChannel?.send(JSON.stringify({
      turn: this.turn,
      arr: this.boardArray
    }))
  }

  // send from remote 
  remoteChannelSender() {
    this.remoteChannel?.send(JSON.stringify({
      turn: this.turn,
      arr: this.boardArray
    }))
  }

  // close
  closeConnection() {
    this.remoteConnection?.close()
    this.localConnection?.close()
  }

  ///chessx
  bp: string = "assets/black/blackpawn.jpg";
  bk: string = "assets/black/blackking.jpg";
  bq: string = "assets/black/blackqueen.jpg";
  bc: string = "assets/black/blackcamel.jpg";
  bh: string = "assets/black/blackhorse.jpg";
  be: string = "assets/black/blackele.jpg";
  em: string = "";
  empObj = { src: "", clipType: "noClip", addCls: "", playerType: "e" };
  blackQueenObj = { src: this.bq, clipType: "clip-queen", addCls: "", playerType: "b" };
  whiteQueenObj = { src: this.bq, clipType: "clip-queen", addCls: "", playerType: "w" };
  disableUndoBtn: any = true;
  turn: string = "w";
  nextTurn: string = "b";
  chngPawn = false;
  isKCheck = false;

  recover: any = {
    i: -1,
    j: -1,
    k: -1,
    l: -1,
    obj: { src: "", clipType: "", addCls: "", playerType: "" }
  };

  boardArray = [
    [
      { src: this.be, clipType: "clip-ele", addCls: "", playerType: "b" },
      { src: this.bh, clipType: "clip-horse", addCls: "", playerType: "b" },
      { src: this.bc, clipType: "clip-camel", addCls: "", playerType: "b" },
      { src: this.bk, clipType: "clip-king", addCls: "", playerType: "b" },
      { src: this.bq, clipType: "clip-queen", addCls: "", playerType: "b" },
      { src: this.bc, clipType: "clip-camel", addCls: "", playerType: "b" },
      { src: this.bh, clipType: "clip-horse", addCls: "", playerType: "b" },
      { src: this.be, clipType: "clip-ele", addCls: "", playerType: "b" },
    ],
    [
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "b" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "b" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "b" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "b" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "b" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "b" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "b" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "b" },
    ],
    [
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
    ],
    [
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
    ],
    [
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
    ],
    [
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
      { src: "", clipType: "noClip", addCls: "", playerType: "e" },
    ],
    [
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "w" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "w" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "w" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "w" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "w" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "w" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "w" },
      { src: this.bp, clipType: "clip-pawn", addCls: "", playerType: "w" },
    ],
    [
      { src: this.be, clipType: "clip-ele", addCls: "", playerType: "w" },
      { src: this.bh, clipType: "clip-horse", addCls: "", playerType: "w" },
      { src: this.bc, clipType: "clip-camel", addCls: "", playerType: "w" },
      { src: this.bk, clipType: "clip-king", addCls: "", playerType: "w" },
      { src: this.bq, clipType: "clip-queen", addCls: "", playerType: "w" },
      { src: this.bc, clipType: "clip-camel", addCls: "", playerType: "w" },
      { src: this.bh, clipType: "clip-horse", addCls: "", playerType: "w" },
      { src: this.be, clipType: "clip-ele", addCls: "", playerType: "w" },
    ]
  ];

  lstInd: any = [-1, 0];

  move(i: any, j: any): any {
    if (this.lstInd[0] == -1) {

      if (this.checkTurnNselectedPiece(i, j)) {
        this.lstInd[0] = i;
        this.lstInd[1] = j;
        this.optionsFP(i, j);
        this.boardArray[i][j].addCls = "selected";
        this.disableUndoBtn = true;
      } else {
        return false;
      }

    }
    else {

      let k = this.lstInd[0];
      let l = this.lstInd[1];

      if (this.cond2(i, j, k, l)) {

        if (this.boardArray[i][j].addCls == "moveOpt") {
          this.isKCheck = false;
          this.boardArray[i][j].addCls = "";
          this.boardArray[k][l].addCls = "";
          this.recover.obj.src = this.boardArray[i][j].src;
          // this.recover.obj.playerC = this.boardArray[i][j].playerC; Depricated
          this.recover.obj.playerType = this.boardArray[i][j].playerType;
          this.recover.obj.clipType = this.boardArray[i][j].clipType;
          this.recover.obj.addCls = this.boardArray[i][j].addCls;

          this.swip(i, j, k, l);

          if (this.chngPawn) {
            this.chngPawn = false;
            if (this.turn == "w") {
              this.fill(i, j, this.whiteQueenObj);
            } else
              this.fill(i, j, this.blackQueenObj);

          }

          this.fill(k, l);
          // saving last positions
          this.recover.i = i;
          this.recover.j = j;
          this.recover.k = k;
          this.recover.l = l;
          this.lstInd[0] = -1;
          this.clearOpt();
          this.disableUndoBtn = false;
          this.turn = (this.turn == "w") ? "b" : "w";
          this.nextTurn = (this.nextTurn == "w") ? "b" : "w";
          this.findKIng();

        }
      }

    }
  }

  swip(i: any, j: any, k: any, l: any) {
    this.boardArray[i][j].src = this.boardArray[k][l].src;
    // this.boardArray[i][j].playerC = this.boardArray[k][l].playerC; Depricated
    this.boardArray[i][j].playerType = this.boardArray[k][l].playerType;
    this.boardArray[i][j].clipType = this.boardArray[k][l].clipType;
    this.boardArray[i][j].addCls = this.boardArray[k][l].addCls;
  }

  fill(i: any, j: any, obj: any = this.empObj) {
    this.boardArray[i][j].src = obj.src;
    // this.boardArray[i][j].playerC = obj.playerC; Depricated
    this.boardArray[i][j].playerType = obj.playerType;
    this.boardArray[i][j].clipType = obj.clipType;
    this.boardArray[i][j].addCls = obj.addCls;
  }

  markKingChk(kingChk: any) {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (this.boardArray[x][y].src == this.bk && this.boardArray[x][y].playerType == this.turn)
          if (kingChk)
            this.boardArray[x][y].addCls = "kingCheck";
      }
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
    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, 1, -1, -1, this.bc, this.bq);

    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, -1, 1, -1, this.bc, this.bq);
    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, -1, -1, -1, this.bc, this.bq);

    if (this.turn == 'w') {
      if (this.boardArray[i][j].addCls != "kingCheck")
        this.ckhKing(i, j, -1, 1, 1, this.bp);
      if (this.boardArray[i][j].addCls != "kingCheck")
        this.ckhKing(i, j, -1, -1, 1, this.bp);
    } else {
      if (this.boardArray[i][j].addCls != "kingCheck")
        this.ckhKing(i, j, 1, 1, 1, this.bp);
      if (this.boardArray[i][j].addCls != "kingCheck")
        this.ckhKing(i, j, 1, -1, 1, this.bp);
    }

    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, 2, 1, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, 2, -1, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, -2, -1, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, -2, 1, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, 1, 2, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, 1, -2, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, -1, -2, 1, this.bh);
    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, -1, 2, 1, this.bh);

    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, 0, -1, -1, this.be, this.bq);
    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, 0, 1, -1, this.be, this.bq);
    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, 1, 0, -1, this.be, this.bq);
    if (this.boardArray[i][j].addCls != "kingCheck")
      this.ckhKing(i, j, -1, 0, -1, this.be, this.bq);
  }

  ckhKing(i: any, j: any, stpI: any, stpJ: any, count: any, ...chkFor: any): any {
    let ind = 1;
    while (this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == "e" || this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == this.nextTurn) {
      if (this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.src == chkFor[0] || this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.src == chkFor?.[1]) {
        this.boardArray[i][j].addCls = "kingCheck"; this.isKCheck = true;
      } else if (!(this.boardArray[i + (stpI * ind)]?.[j + (stpJ * ind)]?.playerType == "e")) {
        break;
      }

      if (ind == count) {
        break;
      }
      ind++;
    }
  }
  //conditions 1///
  checkTurnNselectedPiece(i: any, j: any): any {
    return this.turn == this.boardArray[i][j].playerType
  }
  // 2
  cond2(i: any, j: any, k: any, l: any): any {
    if (this.boardArray[i][j].playerType == this.turn) {
      this.boardArray[k][l].addCls = "";
      this.boardArray[i][j].addCls = "selected";
      this.lstInd[0] = i;
      this.lstInd[1] = j;
      this.optionsFP(i, j);
      this.markKingChk(this.isKCheck);
      return false;
    } else {
      return true
    }
  }
  // clesrrr
  clearOpt(remove: any = "kingCheck") {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        this.boardArray[i][j].addCls = (this.boardArray[i][j].addCls == "selected" || this.boardArray[i][j].addCls == remove) ? this.boardArray[i][j].addCls : "";
        // this.boardArray[i][j].addCls = ''

      }
    }
  }

  optionsFP(i: any, j: any) {
    this.clearOpt();
    if (this.boardArray[i][j].src == this.bp) {
      let steps = -1;
      if (this.boardArray[i][j].playerType == "b") {
        steps = 1;
      }
      if (this.boardArray[i + steps]?.[j]?.playerType == "e") {
        if (!this.dhundo((i + steps), (j), i, j)) {
          this.boardArray[i + steps][j].addCls = "moveOpt";
          if (i + steps == 0 || i + steps == 7) { this.chngPawn = true; } else { this.chngPawn = false; }
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
          if (i + steps == 0 || i + steps == 7) { this.chngPawn = true; } else { this.chngPawn = false; }
        }
      }
      if (this.boardArray[i + steps]?.[j - 1]?.playerType == this.nextTurn) {
        if (!this.dhundo((i + steps), (j - 1), i, j)) {
          this.boardArray[i + steps][j - 1].addCls = "moveOpt";
          if (i + steps == 0 || i + steps == 7) { this.chngPawn = true; } else { this.chngPawn = false; }
        }
      }
    }
    else if (this.boardArray[i][j].src == this.bc) {
      this.chkOpt(i, j, 1, 1);
      this.chkOpt(i, j, 1, -1);
      this.chkOpt(i, j, -1, -1);
      this.chkOpt(i, j, -1, 1);
    }
    else if (this.boardArray[i][j].src == this.be) {
      this.chkOpt(i, j, 1, 0);
      this.chkOpt(i, j, -1, 0);
      this.chkOpt(i, j, 0, -1);
      this.chkOpt(i, j, 0, 1);
    }
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
    else {
      alert("error error.......")
    }
  }
  // options for selecteded piece 
  chkOpt(i: any, j: any, stpI: any, stpJ: any) {
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

  dhundo(oi: any, oj: any, pi: any, pj: any): any {
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

  ckhCheck(i: any, j: any, stpI: any, stpJ: any, oi: any, oj: any, pi: any, pj: any, count: any, ...chkFor: any): any {
    // alert(pi + "p" + pj);
    // alert(oi + "p" + oj);
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
  /////undo//////
  undo() {

    this.clearOpt();
    this.swip(this.recover.k, this.recover.l, this.recover.i, this.recover.j);
    this.fill(this.recover.i, this.recover.j, this.recover.obj);

    this.turn = (this.turn == "w") ? "b" : "w";
    this.nextTurn = (this.nextTurn == "w") ? "b" : "w";
    this.disableUndoBtn = true;
    this.lstInd[0] = -1;
    this.findKIng();
  }

  rotX(ran: any, b: any) {
    console.log(ran.value);
    // b.style.transform = "rotateX(" +ran.value+"deg)";
    b.style.transform = "rotate3d(0," + -ran.value + ",1,180deg)";
    // b.style.transform = "rotate3d(0,1,1,180deg)";
    // console.log(b.style);
    // this.tr = "transform : rotateX("+-(ran.value)+"deg)";
  }
  rotY(ran: any, b: any) {
    console.log(ran.value);
    // b.style.transform = "rotateX(" +ran.value+"deg)";
    b.style.transform = "rotate3d(0,1,0," + ran.value + "deg)";
    // console.log(b.style);
  }
}

