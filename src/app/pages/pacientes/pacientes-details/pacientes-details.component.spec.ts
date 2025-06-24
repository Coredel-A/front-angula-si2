import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacientesDetailsComponent } from './pacientes-details.component';

describe('PacientesDetailsComponent', () => {
  let component: PacientesDetailsComponent;
  let fixture: ComponentFixture<PacientesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacientesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacientesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
