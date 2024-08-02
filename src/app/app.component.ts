import { HttpClient } from '@angular/common/http';
import { Component, inject, Injectable } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { injectMutation, injectQuery, injectQueryClient, QueryObserver } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'reto-tanstack';

  todoService = inject(TodoService);
  queryClient = injectQueryClient();

  observer$ = new QueryObserver(this.queryClient, { queryKey: ['posts'] });

  ngOnInit(): void {
    this.data();
  }

  data() {
    this.observer$.subscribe((result: any) => {
      console.log('result', result);
    });
  }

  query = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => this.todoService.getTodos(),
  }));

  queryPost = injectQuery(() => ({
    queryKey: ['posts'],
    queryFn: () => this.todoService.getPosts(),
  }));



  mutation = injectMutation((client) => ({
    mutationFn: (todo: Todo) => this.todoService.addTodo(todo),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['todos'] });
    },
  }));

  onAddTodo() {
    this.mutation.mutate({
      id: Date.now().toString(),
      title: 'Do Laundry',
    });
  }
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);

  getTodos(): Promise<Todo[]> {
    return lastValueFrom(
      this.http.get<Todo[]>('https://jsonplaceholder.typicode.com/todos')
    );
  }

  getPosts(): Promise<Post[]> {
    return lastValueFrom(
      this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts')
    );
  }

  addTodo(todo: Todo): Promise<Todo> {
    return lastValueFrom(
      this.http.post<Todo>('https://jsonplaceholder.typicode.com/todos', todo)
    );
  }
}

interface Todo {
  id: string;
  title: string;
}

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string
}

