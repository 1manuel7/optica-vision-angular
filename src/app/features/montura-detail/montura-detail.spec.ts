import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonturaDetail } from './montura-detail';

describe('MonturaDetail', () => {
  let component: MonturaDetail;
  let fixture: ComponentFixture<MonturaDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonturaDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(MonturaDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
