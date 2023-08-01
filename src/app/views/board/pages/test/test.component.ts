import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RtmClient } from 'agora-rtm-sdk';
import { AgoraRTMServiceService } from 'src/app/services/agora-rtmservice.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  gameType = ''
  username = ''
  roomId = ''
  roomKey = ''
  constructor(
    private agoraRTMServiceService: AgoraRTMServiceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // this.agoraRTMServiceService.RTMClient.subscribe((res: RtmClient) => {
    //   console.log(res)
    // })
  }

  setGameMode(type: string) {
    this.gameType = type;
  }

  enterToRoom() {
    this.router.navigate(['/board/default', this.username, this.roomId, this.roomKey])
  }
}
