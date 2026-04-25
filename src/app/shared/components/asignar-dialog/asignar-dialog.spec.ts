import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarDialog } from './asignar-dialog';

describe('AsignarDialog', () => {
  let component: AsignarDialog;
  let fixture: ComponentFixture<AsignarDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignarDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(AsignarDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
