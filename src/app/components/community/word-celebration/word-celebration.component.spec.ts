import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordCelebrationComponent } from './word-celebration.component';

describe('WordCelebrationComponent', () => {
  let component: WordCelebrationComponent;
  let fixture: ComponentFixture<WordCelebrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordCelebrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordCelebrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
