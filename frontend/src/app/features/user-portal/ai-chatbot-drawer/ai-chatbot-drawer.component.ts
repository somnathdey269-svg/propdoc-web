import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyProject } from '../../../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-ai-chatbot-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 bg-slate-950/98 backdrop-blur-3xl border-l border-white/20 shadow-2xl p-4 flex flex-col justify-between">
      
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
            ✨
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">UrbanX AI Assistant</h3>
            <span class="text-[10px] text-purple-400">Gemini Powered Real Estate Search</span>
          </div>
        </div>
        <button (click)="closeDrawer.emit()" class="p-1.5 rounded-full bg-slate-900 text-slate-400 hover:text-white">
          ✕
        </button>
      </div>

      <!-- Messages Stream -->
      <div class="flex-1 overflow-y-auto py-4 space-y-3 font-sans text-xs">
        <div *ngFor="let m of messages()" [class.text-right]="m.sender === 'user'">
          <div
            [class.bg-purple-950]="m.sender === 'ai'"
            [class.border-purple-500-30]="m.sender === 'ai'"
            [class.text-purple-100]="m.sender === 'ai'"
            [class.bg-slate-800]="m.sender === 'user'"
            [class.text-white]="m.sender === 'user'"
            class="inline-block p-3 rounded-2xl border text-left max-w-[85%]"
          >
            {{ m.text }}
          </div>
        </div>
      </div>

      <!-- Quick Suggestion Chips -->
      <div class="flex flex-wrap gap-1.5 pb-2">
        <button (click)="sendQuery('Show me 3 BHK in Bodakdev under 1.5 Cr')" class="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-purple-300">
          📍 3 BHK Bodakdev
        </button>
        <button (click)="sendQuery('Show bank auction deals in South Bopal')" class="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-amber-300">
          🏛️ Bank Auctions
        </button>
        <button (click)="sendQuery('Show GIFT City commercial office listings')" class="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-cyan-300">
          🏢 GIFT City SEZ
        </button>
      </div>

      <!-- Input Form -->
      <form (ngSubmit)="sendInput()" class="flex items-center gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          [(ngModel)]="query"
          name="query"
          placeholder="Ask AI property questions..."
          class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
        <button type="submit" class="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md">
          Send
        </button>
      </form>

    </div>
  `
})
export class AiChatbotDrawerComponent {
  @Input() projects: PropertyProject[] = [];
  @Output() closeDrawer = new EventEmitter<void>();
  @Output() selectProject = new EventEmitter<PropertyProject>();

  query = '';

  messages = signal<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: '🙏 Welcome to UrbanX AI Assistant! I search across GujRERA, 99acres, SquareYards, and MagicBricks to find verified properties in Ahmedabad & Gandhinagar. What property features or price range are you interested in?'
    }
  ]);

  sendInput() {
    if (!this.query.trim()) return;
    this.sendQuery(this.query);
    this.query = '';
  }

  sendQuery(text: string) {
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
    this.messages.update(list => [...list, userMsg]);

    setTimeout(() => {
      const q = text.toLowerCase();
      let match = this.projects.find(p => p.locality.toLowerCase().includes(q) || p.name.toLowerCase().includes(q));
      if (!match && this.projects.length > 0) match = this.projects[0];

      const aiReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: match
          ? `I found "${match.name}" in ${match.locality}! It features 4-portal matched pricing starting at ₹ ${(match.priceRangeMinInr / 100000).toFixed(2)} Lacs with GujRERA ID: ${match.reraNumber}.`
          : `I have analyzed 200+ micro-markets in Ahmedabad. Let me filter the finest projects matching your criteria!`
      };

      this.messages.update(list => [...list, aiReply]);
      if (match) this.selectProject.emit(match);
    }, 600);
  }
}
