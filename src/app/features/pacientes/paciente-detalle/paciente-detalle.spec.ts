import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteDetalle } from './paciente-detalle';

describe('PacienteDetalle', () => {
  let component: PacienteDetalle;
  let fixture: ComponentFixture<PacienteDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteDetalle],
    }).compileComponents();

    fixture = TestBed.createComponent(PacienteDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
