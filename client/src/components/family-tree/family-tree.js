import BalkanFamilyTree from '@balkangraph/familytree.js';
import { useEffect, useRef } from 'react';
import './family-tree.css';

BalkanFamilyTree.templates.john_male.node += '<text class="male-icon" x="30" y="82">👨</text>';
BalkanFamilyTree.templates.john_female.node += '<text class="female-icon" x="30" y="82">👩</text>';

BalkanFamilyTree.templates.john_male.field_0 = '<text class="name" x="60" y="140" text-anchor="middle">{val}</text>';
BalkanFamilyTree.templates.john_female.field_0 = '<text class="name" x="60" y="140" text-anchor="middle">{val}</text>';

function convertToBalkanFamilyTree(familyData) {
  let formattedData = [];
  const parentIdsMap = {};

  if (familyData) {
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

  useEffect(() => {
    // Initialize the FamilyTree component
    const tree = new BalkanFamilyTree(treeRef.current, {
      enableSearch: false,
      draggable: false,
      mouseScrool: BalkanFamilyTree.none,
      template: "john",
      nodeBinding: {
        field_0: "name"
      },
      nodes: convertToBalkanFamilyTree(familyData)
    });
  }, [familyData]);

  return <div ref={treeRef}></div>;
};
