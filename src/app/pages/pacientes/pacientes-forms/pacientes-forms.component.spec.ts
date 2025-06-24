import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacientesFormsComponent } from './pacientes-forms.component';

describe('PacientesFormsComponent', () => {
  let component: PacientesFormsComponent;
  let fixture: ComponentFixture<PacientesFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacientesFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacientesFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
