<?php
namespace App\Console\Commands;

use App\Services\EsimAccessService;
use App\Models\EsimPackage;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class SyncEsimPackages extends Command
{
    protected $signature = 'esim:sync-packages';
    protected $description = 'Sync eSIM packages from API';

    public function handle(EsimAccessService $service)
    {
        $this->info('Syncing eSIM packages...');
        
        $result = $service->getPackages('ID');
        
        if (!$result['success']) {
            $this->error('Failed: ' . $result['error']);
            return 1;
        }

        $bar = $this->output->createProgressBar(count($result['packages']));
        
        foreach ($result['packages'] as $pkg) {
            EsimPackage::updateOrCreate(
                ['package_code' => $pkg['packageCode']],
                [
                    'slug' => Str::slug($pkg['name']),
                    'location_code' => $pkg['locationCode'],
                    'location_name' => $pkg['locationName'] ?? 'Indonesia',
                    'name' => $pkg['name'],
                    'description' => $pkg['description'] ?? null,
                    'price' => ($pkg['price'] ?? 0) / 10000,
                    'data_volume' => $pkg['volume'] ?? 0,
                    'duration' => $pkg['duration'] ?? 0,
                    'duration_unit' => $pkg['durationUnit'] ?? 'DAY',
                    'data_type' => $pkg['dataType'] ?? 1,
                    'metadata' => $pkg
                ]
            );
            $bar->advance();
        }
        
        $bar->finish();
        $this->info("\nSync completed!");
        
        return 0;
    }
}