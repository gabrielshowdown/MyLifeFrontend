import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FoodService } from '../../../services/food.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { FoodItemModalComponent } from '../food-item-modal/food-item-modal.component';
import {
  FOOD_CATEGORIES, FOOD_LOCATIONS, FOOD_STATUS_LABELS, FOOD_TRAITS, FOOD_UNITS,
  FoodCategory, FoodItem, FoodLocation, FoodStatus, FoodTrait,
  daysSince, daysUntil, getFoodStatus
} from '../../../interfaces/food';

@Component({
  selector: 'app-food-expiration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './food-expiration.component.html',
  styleUrls: ['./food-expiration.component.scss']
})
export class FoodExpirationComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly categories = FOOD_CATEGORIES;
  readonly locations = FOOD_LOCATIONS;
  readonly statusLabels = FOOD_STATUS_LABELS;
  readonly traits = FOOD_TRAITS;
  readonly statusOptions: FoodStatus[] = ['EXPIRED', 'CRITICAL', 'WARNING', 'OK', 'NO_DATE'];
  readonly alertDaysOptions: number[] = [3, 7, 15, 30];
  readonly displayedColumns: string[] = ['status', 'name', 'category', 'location', 'quantity', 'expirationDate', 'actions'];

  items: FoodItem[] = [];
  dataSource = new MatTableDataSource<FoodItem>([]);

  /* Filtros */
  searchText: string = '';
  categoryFilter: FoodCategory | '' = '';
  locationFilter: FoodLocation | '' = '';
  statusFilter: FoodStatus | '' = '';
  traitFilter: FoodTrait[] = [];
  onlyOpened: boolean = false;
  alertDays: number = 7;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private subscription?: Subscription;

  constructor(
    private foodService: FoodService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subscription = this.foodService.getItems().subscribe(items => {
      this.items = items;
      this.applyFilters();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    /* Ordenação por colunas calculadas ou com tipo diferente de string */
    this.dataSource.sortingDataAccessor = (item: FoodItem, column: string) => {
      switch (column) {
        /* Itens sem vencimento vão para o fim da ordenação crescente */
        case 'status':
        case 'expirationDate': return item.expirationDate ? daysUntil(item.expirationDate) : Number.MAX_SAFE_INTEGER;
        case 'quantity': return item.quantity;
        default: return String((item as any)[column] ?? '').toLowerCase();
      }
    };
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /* ---------- Resumo ---------- */

  get expiredCount(): number {
    return this.items.filter(i => this.statusOf(i) === 'EXPIRED').length;
  }

  get expiringCount(): number {
    return this.items.filter(i => ['CRITICAL', 'WARNING'].includes(this.statusOf(i))).length;
  }

  get openedCount(): number {
    return this.items.filter(i => i.opened).length;
  }

  /* ---------- Filtros ---------- */

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.dataSource.data = this.items
      .filter(i => !search || i.name.toLowerCase().includes(search) || (i.notes ?? '').toLowerCase().includes(search))
      .filter(i => !this.categoryFilter || i.category === this.categoryFilter)
      .filter(i => !this.locationFilter || i.location === this.locationFilter)
      .filter(i => !this.statusFilter || this.statusOf(i) === this.statusFilter)
      .filter(i => !this.onlyOpened || i.opened)
      .filter(i => this.traitFilter.every(t => this.hasTrait(i, t)))
      /* Ordenação padrão: vencimento mais próximo primeiro, sem vencimento por último
         (o clique no cabeçalho sobrepõe) */
      .sort((a, b) => (a.expirationDate ?? '9999-12-31').localeCompare(b.expirationDate ?? '9999-12-31'));
  }

  hasTrait(item: FoodItem, trait: FoodTrait): boolean {
    switch (trait) {
      case 'GLUTEN_FREE': return item.glutenFree;
      case 'LACTOSE_FREE': return item.lactoseFree;
      case 'HOMEMADE': return item.homemade;
    }
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchText || this.categoryFilter || this.locationFilter || this.statusFilter
      || this.traitFilter.length || this.onlyOpened);
  }

  clearFilters(): void {
    this.searchText = '';
    this.categoryFilter = '';
    this.locationFilter = '';
    this.statusFilter = '';
    this.traitFilter = [];
    this.onlyOpened = false;
    this.applyFilters();
  }

  /* Clique nos cards de resumo: alterna o filtro de status (clicar de novo remove) */
  toggleStatusFilter(status: FoodStatus | ''): void {
    this.statusFilter = this.statusFilter === status ? '' : status;
    this.applyFilters();
  }

  toggleOpenedFilter(): void {
    this.onlyOpened = !this.onlyOpened;
    this.applyFilters();
  }

  /* ---------- Helpers de exibição ---------- */

  statusOf(item: FoodItem): FoodStatus {
    return getFoodStatus(item.expirationDate, this.alertDays);
  }

  /* Emoji do item, ou o da categoria quando não foi informado */
  emojiOf(item: FoodItem): string {
    return item.emoji?.trim() || this.categoryOf(item)?.emoji || '🍽️';
  }

  daysText(item: FoodItem): string {
    if (!item.expirationDate) {
      /* Sem vencimento: mostra há quanto tempo foi preparado/congelado, se souber */
      if (item.purchaseDate) {
        const days = daysSince(item.purchaseDate);
        return days <= 0 ? 'Preparado hoje' : `Preparado há ${days} ${days === 1 ? 'dia' : 'dias'}`;
      }
      return 'Sem prazo definido';
    }

    const days = daysUntil(item.expirationDate);
    if (days < -1) return `Venceu há ${Math.abs(days)} dias`;
    if (days === -1) return 'Venceu ontem';
    if (days === 0) return 'Vence hoje';
    if (days === 1) return 'Vence amanhã';
    return `Vence em ${days} dias`;
  }

  categoryOf(item: FoodItem) {
    return this.categories.find(c => c.value === item.category);
  }

  locationOf(item: FoodItem) {
    return this.locations.find(l => l.value === item.location);
  }

  unitLabel(item: FoodItem): string {
    return FOOD_UNITS.find(u => u.value === item.unit)?.label ?? '';
  }

  /* ---------- Ações ---------- */

  openItemModal(item?: FoodItem): void {
    const dialogRef = this.dialog.open(FoodItemModalComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { item }
    });

    dialogRef.afterClosed().subscribe(payload => {
      if (!payload) return;
      this.foodService.save(payload).subscribe(saved => {
        this.notify(item ? `"${saved.name}" atualizado.` : `"${saved.name}" adicionado.`);
      });
    });
  }

  removeItem(item: FoodItem, reason: 'CONSUMED' | 'DISCARDED'): void {
    const consumed = reason === 'CONSUMED';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: consumed ? 'Marcar como consumido?' : 'Descartar item?',
        message: consumed
          ? `"${item.name}" será removido da lista como consumido.`
          : `"${item.name}" será removido da lista como descartado.`,
        confirmText: consumed ? 'Sim, consumido' : 'Sim, descartar',
        confirmButtonColor: consumed ? 'primary' : 'warn'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.foodService.remove(item.id, reason).subscribe(() => {
        this.notify(consumed ? `"${item.name}" marcado como consumido.` : `"${item.name}" descartado.`);
      });
    });
  }

  private notify(message: string): void {
    this._snackBar.open(message, 'Fechar', { duration: 3000 });
  }
}
