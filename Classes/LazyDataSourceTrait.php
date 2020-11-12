<?php
namespace Sandstorm\LazyDataSource;

use Neos\ContentRepository\Domain\Model\NodeInterface;

trait LazyDataSourceTrait
{

    /**
     * @param NodeInterface $node The node that is currently edited (optional)
     * @param array $arguments Additional arguments (key / value)
     * @return array
     */
    public function getData(NodeInterface $node = null, array $arguments = [])
    {
        if (isset($arguments['identifiers'])) {
            $identifiers = $arguments['identifiers'];
            unset($arguments['identifiers']);
            return $this->getDataForIdentifiers($identifiers, $node, $arguments);
        } elseif (isset($arguments['searchTerm'])) {
            $searchTerm = $arguments['searchTerm'];
            unset($arguments['searchTerm']);
            return $this->searchData($searchTerm, $node, $arguments);
        }

        return [];
    }

    /**
     * This method is called when the identifiers are known (from the client-side); and we need to load
     * these data records specifically.
     *
     * @param array $identifiers
     * @param NodeInterface|null $node
     * @param array $arguments
     * @return mixed
     */
    abstract protected function getDataForIdentifiers(array $identifiers, NodeInterface $node = null, array $arguments = []);

    /**
     * This method is called when the user specifies a search term.
     *
     * @param string $searchTerm
     * @param NodeInterface|null $node
     * @param array $arguments
     * @return mixed
     */
    abstract protected function searchData(string $searchTerm, NodeInterface $node = null, array $arguments = []);
}
