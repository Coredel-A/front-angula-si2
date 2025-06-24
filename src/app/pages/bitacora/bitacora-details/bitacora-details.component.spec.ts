import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitacoraDetailsComponent } from './bitacora-details.component';

describe('BitacoraDetailsComponent', () => {
  let component: BitacoraDetailsComponent;
  let fixture: ComponentFixture<BitacoraDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BitacoraDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BitacoraDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
