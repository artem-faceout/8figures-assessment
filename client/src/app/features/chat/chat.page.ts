import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
import { ChatService } from '@app/core/services/chat.service';
import { OnboardingService } from '@app/core/services/onboarding.service';
import { PortfolioService } from '@app/core/services/portfolio.service';
import { getSuggestionChips } from './constants/suggestion-chips';
import { PortfolioSummaryCardComponent } from './components/portfolio-summary-card/portfolio-summary-card.component';
import type { ChatConfig, ChatMessage, SuggestionChip } from '@app/core/models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    PortfolioSummaryCardComponent,
  ],
  templateUrl: './chat.page.html',
  styleUrl: './chat.page.scss',
})
export class ChatPage implements OnInit, OnDestroy {
  private readonly chatService = inject(ChatService);
  private readonly portfolioService = inject(PortfolioService);
  private readonly onboardingService = inject(OnboardingService);
  private readonly router = inject(Router);
  private readonly modalController = inject(ModalController);

  // Modal input — used when opened as modal (common/asset mode)
  readonly config = input<ChatConfig | undefined>(undefined);

  @ViewChild('messageList') private messageList!: ElementRef<HTMLDivElement>;

  readonly messages = this.chatService.messages;
  readonly isStreaming = this.chatService.isStreaming;
  readonly isPortfolioReady = this.chatService.isPortfolioReady;
  readonly thinkingPhrase = this.chatService.thinkingPhrase;
  readonly canSend = this.chatService.canSend;
  readonly portfolio = this.portfolioService.portfolio;

  readonly inputText = signal('');
  private resolvedConfig: ChatConfig | null = null;

  readonly isModal = computed(() =>
    this.resolvedConfig?.mode === 'common' || this.resolvedConfig?.mode === 'asset'
  );

  readonly chips = computed<SuggestionChip[]>(() => {
    if (!this.resolvedConfig) return [];
    return getSuggestionChips(this.resolvedConfig.mode, this.resolvedConfig.persona);
  });

  ngOnInit(): void {
    // Config comes from either modal input or router state
    const modalConfig = this.config();
    if (modalConfig) {
      this.resolvedConfig = modalConfig;
    } else {
      const nav = this.router.getCurrentNavigation();
      const state = nav?.extras?.state as ChatConfig | undefined;
      if (state?.mode) {
        this.resolvedConfig = state;
      } else {
        // Fallback — try to read from history state
        const historyState = history.state as ChatConfig | undefined;
        if (historyState?.mode) {
          this.resolvedConfig = historyState;
        }
      }
    }

    if (!this.resolvedConfig) {
      this.resolvedConfig = {
        mode: 'onboarding',
        persona: this.onboardingService.investmentProfile() ?? 'beginner',
      };
    }

    this.chatService.init(this.resolvedConfig);
    this.chatService.addInitialGreeting();
  }

  ngOnDestroy(): void {
    this.chatService.cancelStream();
  }

  async onSend(): Promise<void> {
    const text = this.inputText().trim();
    if (!text || !this.canSend()) return;

    this.inputText.set('');
    await this.chatService.sendMessage(text);
    this.scrollToBottom();
  }

  onChipTap(chip: SuggestionChip): void {
    if (!this.canSend()) return;
    this.inputText.set(chip.label);
    this.onSend();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  onBack(): void {
    if (this.isModal()) {
      this.modalController.dismiss();
    } else {
      this.router.navigate(['/onboarding']);
    }
  }

  onPortfolioCta(): void {
    this.onboardingService.nextStep();
    this.router.navigate(['/onboarding']);
  }

  trackByMessage(_index: number, msg: ChatMessage): string {
    return `${msg.role}-${msg.timestamp.getTime()}`;
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      const el = this.messageList?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }
}
