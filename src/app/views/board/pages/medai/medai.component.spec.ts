import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedaiComponent } from './medai.component';

describe('MedaiComponent', () => {
  let component: MedaiComponent;
  let fixture: ComponentFixture<MedaiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedaiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
