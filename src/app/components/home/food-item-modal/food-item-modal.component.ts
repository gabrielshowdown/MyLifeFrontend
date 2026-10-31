import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DateMaskDirective } from '../../../shared/date/date-mask.directive';
import {
  FOOD_CATEGORIES, FOOD_LOCATIONS, FOOD_UNITS,
  FoodCategory, FoodItem, FoodLocation, FoodUnit,
  parseIsoDate, toIsoDate
} from '../../../interfaces/food';

@Component({
  selector: 'app-food-item-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSnackBarModule,
    DateMaskDirective
  ],
  templateUrl: './food-item-modal.component.html',
  styleUrls: ['./food-item-modal.component.scss']
})
export class FoodItemModalComponent implements OnInit {

  readonly categories = FOOD_CATEGORIES;
  readonly locations = FOOD_LOCATIONS;
  readonly units = FOOD_UNITS;

  name: string = '';
  category: FoodCategory | null = null;
  location: FoodLocation | null = null;
  quantity: number | null = 1;
  unit: FoodUnit = 'UN';
  expirationDate: Date | null = null;
  purchaseDate: Date | null = null;
  opened: boolean = false;
  openedDate: Date | null = null;
  notes: string = '';
  emoji: string = '';
  glutenFree: boolean = false;
  lactoseFree: boolean = false;
  homemade: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<FoodItemModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item?: FoodItem },
    private _snackBar: MatSnackBar
  ) { }

  get isEdit(): boolean {
    return !!this.data?.item;
  }

  ngOnInit(): void {
    const item = this.data?.item;
    if (!item) return;

    this.name = item.name;
    this.category = item.category;
    this.location = item.location;
    this.quantity = item.quantity;
    this.unit = item.unit;
    this.expirationDate = parseIsoDate(item.expirationDate);
    this.purchaseDate = parseIsoDate(item.purchaseDate);
    this.opened = item.opened;
    this.openedDate = parseIsoDate(item.openedDate);
    this.notes = item.notes ?? '';
    this.emoji = item.emoji ?? '';
    this.glutenFree = item.glutenFree;
    this.lactoseFree = item.lactoseFree;
    this.homemade = item.homemade;
  }

  /* Emoji padrão da categoria escolhida, usado quando o campo de emoji fica vazio */
  get categoryEmoji(): string {
    return this.categories.find(c => c.value === this.category)?.emoji ?? '🍽️';
  }

  onOpenedChange(): void {
    /* Ao marcar como aberto, sugere hoje como data de abertura; ao desmarcar, limpa */
    this.openedDate = this.opened ? (this.openedDate ?? new Date()) : null;
  }

  save(): void {
    if (!this.name.trim()) {
      this.showErros('O nome do item é obrigatório.');
      return;
    }
    if (!this.category || !this.location) {
      this.showErros('Informe a categoria e o local de armazenamento.');
      return;
    }
    if (!this.quantity || this.quantity <= 0) {
      this.showErros('A quantidade deve ser maior que zero.');
      return;
    }
    /* Itens caseiros (ex.: torta congelada) podem não ter vencimento definido */
    if (!this.expirationDate && !this.homemade) {
      this.showErros('A data de vencimento é obrigatória.');
      return;
    }
    if (this.purchaseDate && this.expirationDate && this.purchaseDate > this.expirationDate) {
      this.showErros('A data de compra não pode ser posterior ao vencimento.');
      return;
    }

    const payload: Omit<FoodItem, 'id'> & { id?: number } = {
      id: this.data?.item?.id,
      name: this.name.trim(),
      category: this.category,
      location: this.location,
      quantity: this.quantity,
      unit: this.unit,
      expirationDate: toIsoDate(this.expirationDate),
      purchaseDate: toIsoDate(this.purchaseDate),
      opened: this.opened,
      openedDate: this.opened ? toIsoDate(this.openedDate) : null,
      notes: this.notes.trim(),
      emoji: this.emoji.trim(),
      glutenFree: this.glutenFree,
      lactoseFree: this.lactoseFree,
      homemade: this.homemade
    };

    this.dialogRef.close(payload);
  }

  private showErros(mensagem: string): void {
    this._snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      panelClass: ['mat-toolbar', 'mat-warn']
    });
  }
}
