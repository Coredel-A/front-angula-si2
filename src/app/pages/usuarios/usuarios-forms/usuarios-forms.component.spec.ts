import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosFormsComponent } from './usuarios-forms.component';

describe('UsuariosFormsComponent', () => {
  let component: UsuariosFormsComponent;
  let fixture: ComponentFixture<UsuariosFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
