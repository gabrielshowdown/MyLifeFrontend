import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcursoModalComponent } from './concurso-modal.component';

describe('ConcursoModalComponent', () => {
  let component: ConcursoModalComponent;
  let fixture: ComponentFixture<ConcursoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConcursoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConcursoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
