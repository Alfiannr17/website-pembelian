<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
        $table->id();
        $table->string('invoice_number')->unique();
        $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
        $table->foreignId('game_id')->constrained();
        $table->foreignId('item_id')->constrained();
        $table->string('game_user_id');
        $table->string('email');
        $table->decimal('amount', 10, 2);
        $table->string('payment_method')->nullable();
        $table->enum('status', ['pending', 'paid', 'failed', 'expired'])->default('pending');
        $table->string('midtrans_order_id')->nullable();
        $table->text('midtrans_response')->nullable();
        $table->timestamp('paid_at')->nullable();
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
