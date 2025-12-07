<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEsimOrdersTable extends Migration
{
    public function up()
    {
        Schema::create('esim_orders', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->string('transaction_id')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('esim_package_id')->constrained()->onDelete('cascade');

            $table->string('email');
            $table->string('phone')->nullable();

            $table->decimal('amount', 10, 2);
            $table->string('payment_method')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'expired'])->default('pending');
            $table->enum('order_status', ['pending', 'processing', 'completed', 'failed'])->default('pending');

            $table->string('api_order_no')->nullable();
            $table->json('api_response')->nullable();

            $table->string('midtrans_order_id')->nullable();
            $table->json('midtrans_response')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();

            $table->index('payment_status');
            $table->index('order_status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('esim_orders');
    }
}
