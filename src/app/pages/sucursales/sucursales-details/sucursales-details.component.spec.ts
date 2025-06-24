import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SucursalesDetailsComponent } from './sucursales-details.component';

describe('SucursalesDetailsComponent', () => {
  let component: SucursalesDetailsComponent;
  let fixture: ComponentFixture<SucursalesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SucursalesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SucursalesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
