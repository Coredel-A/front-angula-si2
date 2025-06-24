import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspecialidadesFormsComponent } from './especialidades-forms.component';

describe('EspecialidadesFormsComponent', () => {
  let component: EspecialidadesFormsComponent;
  let fixture: ComponentFixture<EspecialidadesFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspecialidadesFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EspecialidadesFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
