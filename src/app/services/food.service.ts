import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { FoodItem, toIsoDate } from '../interfaces/food';

/* Dados mockados em memória. Quando o backend existir, só o corpo dos métodos muda (HttpClient),
   as assinaturas Observable continuam as mesmas. */
@Injectable({
  providedIn: 'root'
})
export class FoodService {

  private items$ = new BehaviorSubject<FoodItem[]>(this.buildMock());
  private nextId = 100;

  getItems(): Observable<FoodItem[]> {
    return this.items$.asObservable();
  }

  save(item: Omit<FoodItem, 'id'> & { id?: number }): Observable<FoodItem> {
    const current = this.items$.value;
    let saved: FoodItem;

    if (item.id) {
      saved = { ...item, id: item.id };
      this.items$.next(current.map(i => i.id === saved.id ? saved : i));
    } else {
      saved = { ...item, id: this.nextId++ };
      this.items$.next([...current, saved]);
    }
    return of(saved).pipe(delay(150));
  }

  /* Consumido e descartado removem o item da lista; o motivo fica para o histórico futuro */
  remove(id: number, reason: 'CONSUMED' | 'DISCARDED'): Observable<void> {
    this.items$.next(this.items$.value.filter(i => i.id !== id));
    return of(void 0).pipe(delay(150));
  }

  private buildMock(): FoodItem[] {
    const dateFromToday = (offset: number): string => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      return toIsoDate(date)!;
    };

    /* Valores padrão para não repetir os flags falsos em todo item do mock */
    const item = (data: Partial<FoodItem> & Pick<FoodItem, 'id' | 'name' | 'category' | 'location' | 'quantity' | 'unit'>): FoodItem => ({
      opened: false,
      glutenFree: false,
      lactoseFree: false,
      homemade: false,
      ...data
    });

    return [
      item({ id: 1, name: 'Leite integral', category: 'LATICINIOS', location: 'GELADEIRA', quantity: 2, unit: 'L', expirationDate: dateFromToday(-2), purchaseDate: dateFromToday(-14), opened: true, openedDate: dateFromToday(-6), notes: 'Descartar' }),
      item({ id: 2, name: 'Iogurte sem lactose', category: 'LATICINIOS', location: 'GELADEIRA', quantity: 4, unit: 'UN', expirationDate: dateFromToday(0), purchaseDate: dateFromToday(-10), lactoseFree: true }),
      item({ id: 3, name: 'Peito de frango', category: 'CARNES', location: 'FREEZER', quantity: 1.5, unit: 'KG', expirationDate: dateFromToday(1), purchaseDate: dateFromToday(-20), opened: true, openedDate: dateFromToday(-3), notes: 'Usar primeiro', glutenFree: true, lactoseFree: true }),
      item({ id: 4, name: 'Queijo mussarela sem lactose', category: 'LATICINIOS', location: 'GELADEIRA', quantity: 300, unit: 'G', expirationDate: dateFromToday(3), purchaseDate: dateFromToday(-7), opened: true, openedDate: dateFromToday(-4), lactoseFree: true, glutenFree: true }),
      item({ id: 5, name: 'Alface crespa', category: 'HORTIFRUTI', location: 'GELADEIRA', quantity: 1, unit: 'UN', expirationDate: dateFromToday(4), purchaseDate: dateFromToday(-2), glutenFree: true, lactoseFree: true }),
      item({ id: 6, name: 'Tomate', category: 'HORTIFRUTI', location: 'GELADEIRA', quantity: 6, unit: 'UN', expirationDate: dateFromToday(6), purchaseDate: dateFromToday(-1), emoji: '🍅', glutenFree: true, lactoseFree: true }),
      item({ id: 7, name: 'Presunto fatiado', category: 'CARNES', location: 'GELADEIRA', quantity: 200, unit: 'G', expirationDate: dateFromToday(7), purchaseDate: dateFromToday(-5), opened: true, openedDate: dateFromToday(-2), emoji: '🍖' }),
      item({ id: 8, name: 'Pão de forma sem glúten', category: 'DESPENSA', location: 'ARMARIO', quantity: 1, unit: 'PACOTE', expirationDate: dateFromToday(9), purchaseDate: dateFromToday(-3), opened: true, openedDate: dateFromToday(-3), emoji: '🍞', glutenFree: true }),
      item({ id: 9, name: 'Lasanha congelada', category: 'CONGELADOS', location: 'FREEZER', quantity: 2, unit: 'UN', expirationDate: dateFromToday(45), purchaseDate: dateFromToday(-30), emoji: '🍝' }),
      item({ id: 10, name: 'Macarrão espaguete', category: 'DESPENSA', location: 'DESPENSA', quantity: 3, unit: 'PACOTE', expirationDate: dateFromToday(120), purchaseDate: dateFromToday(-40), emoji: '🍝', lactoseFree: true }),
      item({ id: 11, name: 'Arroz branco', category: 'DESPENSA', location: 'DESPENSA', quantity: 5, unit: 'KG', expirationDate: dateFromToday(200), purchaseDate: dateFromToday(-60), opened: true, openedDate: dateFromToday(-20), emoji: '🍚', glutenFree: true, lactoseFree: true }),
      item({ id: 12, name: 'Suco de uva integral', category: 'BEBIDAS', location: 'DESPENSA', quantity: 1, unit: 'L', expirationDate: dateFromToday(60), purchaseDate: dateFromToday(-15), emoji: '🍇', glutenFree: true, lactoseFree: true }),
      item({ id: 13, name: 'Molho de tomate', category: 'DESPENSA', location: 'ARMARIO', quantity: 4, unit: 'UN', expirationDate: dateFromToday(14), purchaseDate: dateFromToday(-25), opened: true, openedDate: dateFromToday(-5), notes: 'Aberto, manter na geladeira', glutenFree: true, lactoseFree: true }),
      item({ id: 14, name: 'Orégano', category: 'TEMPEROS', location: 'ARMARIO', quantity: 1, unit: 'UN', expirationDate: dateFromToday(-20), purchaseDate: dateFromToday(-400), opened: true, openedDate: dateFromToday(-380), glutenFree: true, lactoseFree: true }),

      /* Caseiros: sem vencimento específico, a data de referência é a do preparo/congelamento */
      item({ id: 15, name: 'Torta de frango', category: 'CONGELADOS', location: 'FREEZER', quantity: 2, unit: 'UN', purchaseDate: dateFromToday(-45), homemade: true, emoji: '🥧', notes: 'Porções individuais' }),
      item({ id: 16, name: 'Coxinha', category: 'CONGELADOS', location: 'FREEZER', quantity: 30, unit: 'UN', purchaseDate: dateFromToday(-12), homemade: true, emoji: '🍗' }),
      item({ id: 17, name: 'Pão de queijo', category: 'CONGELADOS', location: 'FREEZER', quantity: 40, unit: 'UN', purchaseDate: dateFromToday(-80), homemade: true, glutenFree: true, emoji: '🧀' }),
      item({ id: 18, name: 'Bolo de cenoura', category: 'OUTROS', location: 'GELADEIRA', quantity: 1, unit: 'UN', expirationDate: dateFromToday(2), purchaseDate: dateFromToday(-2), homemade: true, emoji: '🥕', lactoseFree: true, notes: 'Caseiro, mas com prazo curto' })
    ];
  }
}
