import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetReportComponent } from './bet-report.component';

describe('BetReportComponent', () => {
  let component: BetReportComponent;
  let fixture: ComponentFixture<BetReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BetReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BetReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
