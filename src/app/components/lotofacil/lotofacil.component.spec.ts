import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotofacilComponent } from './lotofacil.component';

describe('LotofacilComponent', () => {
  let component: LotofacilComponent;
  let fixture: ComponentFixture<LotofacilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotofacilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LotofacilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
