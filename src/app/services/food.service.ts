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

    return [
      { id: 1, name: 'Leite integral', category: 'LATICINIOS', location: 'GELADEIRA', quantity: 2, unit: 'L', expirationDate: dateFromToday(-2), purchaseDate: dateFromToday(-14), opened: true, openedDate: dateFromToday(-6), notes: 'Descartar' },
      { id: 2, name: 'Iogurte natural', category: 'LATICINIOS', location: 'GELADEIRA', quantity: 4, unit: 'UN', expirationDate: dateFromToday(0), purchaseDate: dateFromToday(-10), opened: false },
      { id: 3, name: 'Peito de frango', category: 'CARNES', location: 'FREEZER', quantity: 1.5, unit: 'KG', expirationDate: dateFromToday(1), purchaseDate: dateFromToday(-20), opened: true, openedDate: dateFromToday(-3), notes: 'Usar primeiro' },
      { id: 4, name: 'Queijo mussarela', category: 'LATICINIOS', location: 'GELADEIRA', quantity: 300, unit: 'G', expirationDate: dateFromToday(3), purchaseDate: dateFromToday(-7), opened: true, openedDate: dateFromToday(-4) },
      { id: 5, name: 'Alface crespa', category: 'HORTIFRUTI', location: 'GELADEIRA', quantity: 1, unit: 'UN', expirationDate: dateFromToday(4), purchaseDate: dateFromToday(-2), opened: false },
      { id: 6, name: 'Tomate', category: 'HORTIFRUTI', location: 'GELADEIRA', quantity: 6, unit: 'UN', expirationDate: dateFromToday(6), purchaseDate: dateFromToday(-1), opened: false },
      { id: 7, name: 'Presunto fatiado', category: 'CARNES', location: 'GELADEIRA', quantity: 200, unit: 'G', expirationDate: dateFromToday(7), purchaseDate: dateFromToday(-5), opened: true, openedDate: dateFromToday(-2) },
      { id: 8, name: 'Pão de forma', category: 'DESPENSA', location: 'ARMARIO', quantity: 1, unit: 'PACOTE', expirationDate: dateFromToday(9), purchaseDate: dateFromToday(-3), opened: true, openedDate: dateFromToday(-3) },
      { id: 9, name: 'Lasanha congelada', category: 'CONGELADOS', location: 'FREEZER', quantity: 2, unit: 'UN', expirationDate: dateFromToday(45), purchaseDate: dateFromToday(-30), opened: false },
      { id: 10, name: 'Macarrão espaguete', category: 'DESPENSA', location: 'DESPENSA', quantity: 3, unit: 'PACOTE', expirationDate: dateFromToday(120), purchaseDate: dateFromToday(-40), opened: false },
      { id: 11, name: 'Arroz branco', category: 'DESPENSA', location: 'DESPENSA', quantity: 5, unit: 'KG', expirationDate: dateFromToday(200), purchaseDate: dateFromToday(-60), opened: true, openedDate: dateFromToday(-20) },
      { id: 12, name: 'Suco de uva integral', category: 'BEBIDAS', location: 'DESPENSA', quantity: 1, unit: 'L', expirationDate: dateFromToday(60), purchaseDate: dateFromToday(-15), opened: false },
      { id: 13, name: 'Molho de tomate', category: 'DESPENSA', location: 'ARMARIO', quantity: 4, unit: 'UN', expirationDate: dateFromToday(14), purchaseDate: dateFromToday(-25), opened: true, openedDate: dateFromToday(-5), notes: 'Aberto, manter na geladeira' },
      { id: 14, name: 'Orégano', category: 'TEMPEROS', location: 'ARMARIO', quantity: 1, unit: 'UN', expirationDate: dateFromToday(-20), purchaseDate: dateFromToday(-400), opened: true, openedDate: dateFromToday(-380) }
    ];
  }
}
