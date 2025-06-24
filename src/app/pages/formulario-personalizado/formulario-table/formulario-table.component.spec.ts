import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioTableComponent } from './formulario-table.component';

describe('FormularioTableComponent', () => {
  let component: FormularioTableComponent;
  let fixture: ComponentFixture<FormularioTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
