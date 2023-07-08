import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-medai',
  templateUrl: './medai.component.html',
  styleUrls: ['./medai.component.scss']
})
export class MedaiComponent implements OnInit {

  @ViewChild('vdoTag') vdoTag: ElementRef<any> | null = null;
  constructor() { }

  ngOnInit(): void {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((ev) => {
        console.log(ev.getTracks())
        console.log(this.vdoTag?.nativeElement.srcObject);
        if (this.vdoTag) {
          this.vdoTag.nativeElement.setAttribute('autoplay', true);
          this.vdoTag.nativeElement.setAttribute('controls', true);
          this.vdoTag.nativeElement.srcObject = ev
        }
      })

    setTimeout(() => {

    }, 1000);

  }



}
