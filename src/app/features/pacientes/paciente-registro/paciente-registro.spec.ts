import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteRegistro } from './paciente-registro';

describe('PacienteRegistro', () => {
  let component: PacienteRegistro;
  let fixture: ComponentFixture<PacienteRegistro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteRegistro],
    }).compileComponents();

    fixture = TestBed.createComponent(PacienteRegistro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
