<?php
namespace Sandstorm\LazyDataSource;

use Neos\Neos\Service\DataSource\AbstractDataSource;
use Neos\ContentRepository\Domain\Model\NodeInterface;

class MyLazyDataSource extends AbstractDataSource
{

    use LazyDataSourceTrait;

    /**
     * @var string
     */
    static protected $identifier = 'lazy-editor-test';

    protected function getDataForIdentifiers(array $identifiers, NodeInterface $node = null, array $arguments = [])
    {
        $options = [];
        foreach ($identifiers as $id) {
            $options[$id] = ['label' => 'My Label for ' . $id];
        }
        return $options;
    }

    protected function searchData(string $searchTerm, NodeInterface $node = null, array $arguments = [])
    {
        $options = [];
        $options['key'] = ['label' => 'My Label ' . $searchTerm];
        $options['key' . $searchTerm] = ['label' => 'OTHER My Label ' . $searchTerm];
        return $options;
    }
}
