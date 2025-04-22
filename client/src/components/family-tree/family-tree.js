import BalkanFamilyTree from '@balkangraph/familytree.js';
import { useEffect, useRef } from 'react';
import './family-tree.css';

// Restore original templates that were working
BalkanFamilyTree.templates.john_male.node += '<text class="male-icon" x="30" y="82">👨</text>';
BalkanFamilyTree.templates.john_female.node += '<text class="female-icon" x="30" y="82">👩</text>';

BalkanFamilyTree.templates.john_male.field_0 = '<text class="name" x="60" y="140" text-anchor="middle">{val}</text>';
BalkanFamilyTree.templates.john_female.field_0 = '<text class="name" x="60" y="140" text-anchor="middle">{val}</text>';

// Prepare data for the tree
function convertToBalkanFamilyTree(familyData) {
  let formattedData = [];
  const parentIdsMap = {};

  if (familyData && familyData.length > 0) {
    formattedData = familyData;

    // Build a mapping of mother IDs to parents IDs
    formattedData.forEach(m => {
      if (m.mid && m.fid) {
        parentIdsMap[m.mid] = parentIdsMap[m.mid] || [];
        parentIdsMap[m.fid] = parentIdsMap[m.fid] || [];
        parentIdsMap[m.mid].push(m.fid);
        parentIdsMap[m.fid].push(m.mid);
      }
    });

    // Assign unique parent IDs to each family member
    formattedData.forEach(m => {
      if (parentIdsMap[m.id]) {
        m.pids = [...new Set(parentIdsMap[m.id])];
      }
    });
  }

  return formattedData;
}

export const FamilyTree = ({ familyData }) => {
  const treeRef = useRef(null);
  const hasData = familyData && familyData.length > 0;

  useEffect(() => {
    // Initialize the FamilyTree component when data is available
    if (hasData && treeRef.current) {
      const tree = new BalkanFamilyTree(treeRef.current, {
        enableSearch: false,
        draggable: true,
        mouseScrool: BalkanFamilyTree.action.zoom,
        template: "john",
        nodeBinding: {
          field_0: "name"
        },
        nodes: convertToBalkanFamilyTree(familyData)
      });
    }
  }, [familyData, hasData]);

  return (
    <div className="family-tree-container">
      {hasData ? (
        <div className="family-tree-wrapper" ref={treeRef}></div>
      ) : (
        <div className="family-tree-empty">
          <div className="family-tree-empty-icon">👪</div>
          <p className="family-tree-empty-text">
            Enter family details in the form above to generate your family tree
          </p>
        </div>
      )}
    </div>
  );
};
