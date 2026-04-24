import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonturaCardComponent } from './montura-card';

describe('MonturaCardComponent', () => {
  let component: MonturaCardComponent;
  let fixture: ComponentFixture<MonturaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonturaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonturaCardComponent);
    component = fixture.componentInstance;
    
    // Proveemos data falsa para que el @Input requerido no falle en el test
    component.montura = { id: 1, marca: 'Test', modelo: 'Test', material: 'Test', precio: 0, imagen: '' };
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});