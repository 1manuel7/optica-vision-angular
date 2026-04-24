import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonturaList } from './montura-list';

describe('MonturaList', () => {
  let component: MonturaList;
  let fixture: ComponentFixture<MonturaList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonturaList],
    }).compileComponents();

    fixture = TestBed.createComponent(MonturaList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
