import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  channelId: string = ''
  btnText = "Create Game"
  constructor(
    private activatedRoute: ActivatedRoute,
    private route: Router
  ) { }

  ngOnInit(): void {
    this.channelId = this.activatedRoute.snapshot.paramMap.get('cId') as string
    if (this.channelId) {
      this.btnText = "Join Game"
      this.gameType = 'pWf'
    }
  }

  setGameMode(type: string) {
    this.gameType = type;
  }

  enterToRoom() {
    if (this.channelId) {
      this.route.navigate(['/board/default', this.username, this.channelId])
    } else {
      this.route.navigate(['/board/default', this.username])
    }
  }
}
