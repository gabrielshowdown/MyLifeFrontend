import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcursoCardComponent } from './concurso-card.component';

describe('ConcursoCardComponent', () => {
  let component: ConcursoCardComponent;
  let fixture: ComponentFixture<ConcursoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConcursoCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConcursoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
