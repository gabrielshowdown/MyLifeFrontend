import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetModalComponent } from './bet-modal.component';

describe('BetModalComponent', () => {
  let component: BetModalComponent;
  let fixture: ComponentFixture<BetModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BetModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
